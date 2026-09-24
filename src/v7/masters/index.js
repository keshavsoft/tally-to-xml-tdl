import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { executeXml } from "../core/index.js";
import { buildXml } from "../core/buildXml.js";
import bodyJson from "./masters.json" with {type: "json"};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const body = fs.readFileSync(path.join(__dirname, "..", "body.xml"), "utf8");

const get = (company, jsonId) => {
    const { tdlMessage } = bodyJson[jsonId];

    const staticVariables = `<SVCURRENTCOMPANY>${company}</SVCURRENTCOMPANY>`;

    const xml = buildXml(body, {
        staticVariables,
        tdlMessage
    });

    return executeXml(xml);
};

export { get };