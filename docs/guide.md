# tally-to-xml-tdl — Guide

Deep reference for how the library works internally and how to extend it.
 
← **[Back to README](../README.md)** ([HTML Version](guide.html))

---

## Table of contents

- [Architecture](#architecture)
- [The XML template](#the-xml-template)
- [How TDL queries work](#how-tdl-queries-work)
- [Core modules](#core-modules)
- [Adding a new master query](#adding-a-new-master-query)
- [Adding a new voucher type](#adding-a-new-voucher-type)
- [Error handling](#error-handling)

---

## Architecture

The library is organised into three layers:

```
src/v6/
  body.xml          ← shared XML request template
  company/          ← list open companies
  masters/          ← master data (stock, ledger, units ...)
  vouchers/
    purchases/      ← purchase vouchers
    sales/          ← sales vouchers
  core/
    buildXml.js     ← fills the template
    transport/      ← HTTP POST to Tally
    response/       ← XML → JSON
    execute/        ← orchestrates the three steps
```

Every module (company, masters, vouchers) follows the same pattern:

1. Read `body.xml` once at module load time (`fs.readFileSync`)
2. Call `buildXml(body, { staticVariables, tdlMessage })` to fill the template
3. Call `executeXml(xml)` which sends the XML and returns parsed JSON

---

## The XML template

`src/v6/body.xml` is a standard Tally HTTP export envelope with two placeholders:

```xml
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>TDLID</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        {{STATICVARIABLES}}
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="TDLID">
            {{TDLMESSAGE}}
          </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>
```

`buildXml` does a simple string replace:

```js
body
  .replace("{{STATICVARIABLES}}", staticVariables)
  .replace("{{TDLMESSAGE}}", tdlMessage)
```

`staticVariables` carries context Tally needs before the query (company, dates).  
`tdlMessage` is the actual TDL collection definition (what to fetch).

---

## How TDL queries work

Tally's HTTP API accepts a `<COLLECTION>` block inside TDL. The `TYPE` tag is the Tally object type, and `FETCH` tags select which fields to include.

**Example — fetch ledger names with GSTIN:**

```xml
<COLLECTION NAME="TDLID">
  <TYPE>Ledger</TYPE>
  <FETCH>$$Alias:Name</FETCH>
  <FETCH>GSTRegistrationType</FETCH>
  <FETCH>GSTIN</FETCH>
</COLLECTION>
```

This maps to the `"ledgerNamesWithDetails"` key in `masters.json`:

```json
{
  "ledgerNamesWithDetails": {
    "staticVariables": "<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>",
    "tdlMessage": "<TYPE>Ledger</TYPE><FETCH>$$Alias:Name</FETCH><FETCH>GSTRegistrationType</FETCH><FETCH>GSTIN</FETCH>"
  }
}
```

**Example — purchase vouchers with inventory entries:**

```xml
<COLLECTION NAME="TDLID">
  <TYPE>Vouchers:VoucherType</TYPE>
  <CHILDOF>$$$$VchTypePurchase</CHILDOF>
  <BELONGSTO>Yes</BELONGSTO>
  <FETCH>AllInventoryEntries</FETCH>
  <FETCH>Date</FETCH>
</COLLECTION>
```

`$$$$VchTypePurchase` is Tally's built-in formula for the Purchase voucher type.  
`CHILDOF` + `BELONGSTO` filters the collection to only purchase-type vouchers.

---

## Core modules

### `buildXml(body, { staticVariables, tdlMessage })`

Pure string replace. No side effects.

```js
import { buildXml } from "tally-to-xml-tdl/src/v6/core/buildXml.js";

const xml = buildXml(body, {
  staticVariables: "<SVCURRENTCOMPANY>MyCompany</SVCURRENTCOMPANY>",
  tdlMessage: "<TYPE>Ledger</TYPE><FETCH>$$Alias:Name</FETCH>"
});
```

---

### `sendXml({ xml, url })`

HTTP POST to Tally. Returns raw XML response string.

```js
import { sendXml } from "tally-to-xml-tdl/src/v6/core/transport/http.js";

const rawXml = await sendXml({ xml, url: "http://localhost:9000" });
```

---

### `xmlToJson(xml)`

Wraps `fast-xml-parser`. Returns a plain JavaScript object.

```js
import { xmlToJson } from "tally-to-xml-tdl/src/v6/core/response/xmlToJson.js";

const json = xmlToJson(rawXml);
```

---

### `executeXml(xml)`

Combines `sendXml` + `xmlToJson`. This is what every public API call uses.

```js
import { executeXml } from "tally-to-xml-tdl/src/v6/core/execute/executeXml.js";

const json = await executeXml(xml);
```

---

## Adding a new master query

1. Open `src/v6/masters/masters.json`
2. Add an entry with a `tdlMessage` (and optional `staticVariables`):

```json
{
  "costCentres": {
    "staticVariables": "<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>",
    "tdlMessage": "<TYPE>CostCentre</TYPE><FETCH>$$Alias:Name</FETCH>"
  }
}
```

3. Call it:

```js
const result = await masters.get("My Company", "costCentres");
```

That is the entire change. No code to write.

---

## Adding a new voucher type

1. Create a folder: `src/v6/vouchers/receipts/`
2. Add `info.json` with your TDL query
3. Add `index.js` following the same structure as `purchases/index.js`
4. Export it from `src/v6/vouchers/index.js`:

```js
export * as receipts from "./receipts/index.js";
```

---

## Error handling

The library does not catch or wrap errors. If Tally is not running, `fetch` will throw a `TypeError: fetch failed`. Handle it in your code:

```js
try {
  const result = await masters.get("My Company", "stockItems");
} catch (err) {
  if (err.cause?.code === "ECONNREFUSED") {
    console.error("Tally is not running or HTTP port is not enabled.");
  } else {
    throw err;
  }
}
```

Common causes:

| Error | Cause |
|---|---|
| `ECONNREFUSED` | Tally not running, or HTTP port disabled |
| `ECONNRESET` | Tally closed the connection mid-response |
| Empty `COLLECTION` | Company name mismatch or no data for the date range |
