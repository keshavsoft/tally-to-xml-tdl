import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { executeXml, executeXmlAndClean } from "./core/index.js";
import { buildXml } from "./core/buildXml.js";
import bodyJson from "./body.json" with {type: "json"};

import executeBody from "./core/execute/executeBody.js";
import executeXmlFunc from "./core/execute/executeXml.js";
import { cleanTallyResponse } from "./core/cleanTallyResponse.js";
import { xmlToJson } from "./core/response/xmlToJson.js";

import purchaseBody from "./purc/body.json" with {type: "json"};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const body = fs.readFileSync(path.join(__dirname, "body.xml"), "utf8");

const get = (options = {}) => {
    const company = options.company;
    const jsonId = options.jsonId;

    const { tdlMessage } = bodyJson[jsonId];

    const staticVariables = `<SVCURRENTCOMPANY>${company}</SVCURRENTCOMPANY>`;

    const xml = buildXml(body, {
        staticVariables,
        tdlMessage
    });

    return executeXml(xml, options);
};

const clean = (options = {}) => {
    const company = options.company;
    const jsonId = options.jsonId;

    const { tdlMessage } = bodyJson[jsonId];

    const staticVariables = `<SVCURRENTCOMPANY>${company}</SVCURRENTCOMPANY>`;

    const xml = buildXml(body, {
        staticVariables,
        tdlMessage
    });

    return executeXmlAndClean(xml, options);
};

const company = async (showLog = false) => {
    const jsonId = "company";

    const { tdlMessage } = bodyJson[jsonId];
    if (showLog) console.log("tdlMessage : ", tdlMessage);

    const xml = buildXml(body, {
        tdlMessage
    });

    return executeXmlAndClean(xml);
};

const purchase = async () => {
    const retXml = await executeBody(purchaseBody);
    // console.log("retXml : ", retXml);
    const fromTally = xmlToJson(retXml);

    return cleanTallyResponse(fromTally);
};

const purchaseFromXml = async () => {

    const xml = fs.readFileSync(path.join(__dirname, "purc/body.xml"), "utf8");

    const retXml = await executeXmlFunc(xml);
    // console.log("retXml : ", retXml);

    return retXml;
};

const daybook = async () => {

    const xml = fs.readFileSync(path.join(__dirname, "daybook/body.xml"), "utf8");
    console.log("xml : ", xml);
    const retXml = await executeXmlFunc(xml);
    console.log("retXml : ", retXml);

    return retXml;
};

export { get, clean, company, purchase, purchaseFromXml, daybook };