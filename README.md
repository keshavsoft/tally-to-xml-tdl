# tally-to-xml-tdl

> Pull clean, structured JSON from **Tally Prime** — no plugins, no config, just Node.js.

Tally exposes a local HTTP port. This library speaks to it directly via TDL-based XML requests and gives you back plain JavaScript objects ready to use.

📖 **[Full guide →](docs/guide.md)** ([HTML Docs](docs/index.html)) — architecture, internals, how TDL queries work, and how to extend.

---

## How it works

```
Your Code  →  buildXml()  →  HTTP POST  →  Tally :9000
                                               |
Your Code  ←  JSON object  ←  xmlToJson()  ←  XML response
```

Three steps happen inside every call:

1. **Build** — a `body.xml` template is filled with your company name, date range, and TDL query
2. **Send** — the XML is `POST`ed to Tally's local HTTP port (`9000` by default)
3. **Parse** — Tally's XML response is converted to a plain JavaScript object

You get back the raw envelope, exactly as Tally sent it. No magic cleaning, no data loss.

---

## Install

```bash
npm install tally-to-xml-tdl
```

Requires Tally Prime running locally with HTTP port enabled (`Gateway of Tally → F12 → Advanced Config → Enable HTTP`).

---

## Quick start

```js
import { company, masters, vouchers } from "tally-to-xml-tdl";

// List all open companies
const companies = await company();

// Get stock items for a company
const stock = await masters.get("My Company", "stockItems");

// Get purchase vouchers for a date range
const purchases = await vouchers.purchases.period("My Company", "1-Apr-2026", "30-Apr-2026");
```

---

## API

### `company()`

Lists all companies currently open in Tally.

```js
import { company } from "tally-to-xml-tdl";

const result = await company();
// result.ENVELOPE.BODY.DATA.COLLECTION.COMPANY → [ { NAME: "..." }, ... ]
```

---

### `masters.get(company, queryId)`

Fetches master data (stock items, ledgers, units etc.) for a company.

```js
import { masters } from "tally-to-xml-tdl";

const result = await masters.get("My Company", "stockItems");
```

**Available `queryId` values:**

| `queryId` | What you get |
|---|---|
| `uom` | Units of Measure |
| `stockItems` | Stock item names |
| `stockItemsWithBaseUnits` | Stock items + base units |
| `ledgerNames` | Ledger names |
| `ledgerNamesWithDetails` | Ledgers + GST registration + GSTIN |
| `ledgerNamesMoreDetails` | Ledgers + GST reg details list |
| `stockGroups` | Stock group names |
| `stockGroupsAndParent` | Stock groups + parent group |

---

### `vouchers.purchases.period(company, fromDate, toDate)`

Fetches purchase vouchers in a date range.

```js
import { vouchers } from "tally-to-xml-tdl";

const result = await vouchers.purchases.period("My Company", "1-Apr-2026", "30-Apr-2026");

const voucherList = result.ENVELOPE.BODY.DATA.COLLECTION.VOUCHER;
console.log(voucherList.length); // e.g. 46
```

### `vouchers.purchases.all(company)`

Fetches **all** purchase vouchers across all dates.

```js
const result = await vouchers.purchases.all("My Company");
```

---

### `vouchers.sales.get(company, fromDate, toDate, "period")`

Fetches sales vouchers in a date range.

```js
const result = await vouchers.sales.get("My Company", "1-Apr-2026", "30-Apr-2026", "period");
```

---

## Response shape

Every call returns the raw Tally XML envelope parsed into JSON:

```js
{
  ENVELOPE: {
    HEADER: { ... },
    BODY: {
      DATA: {
        COLLECTION: {
          VOUCHER: [ { DATE, GUID, VOUCHERTYPENAME, ... }, ... ]
          // or STOCKITEM, LEDGER, UNIT etc. depending on query
        }
      }
    }
  }
}
```

To work with just the records:

```js
const records = result.ENVELOPE.BODY.DATA.COLLECTION.VOUCHER;
```

---

## Date format

Tally accepts dates in this format: `"1-Apr-2026"`, `"30-Apr-2026"`

---

## Requirements

| Requirement | Detail |
|---|---|
| Node.js | `>=18` (uses native `fetch`) |
| Tally Prime | Any version with HTTP port support |
| HTTP port | Enabled in Tally (`9000` by default) |
| ESM | Package is `"type": "module"` |

---

## License

MIT — [keshavsoft.com](https://keshavsoft.com)
