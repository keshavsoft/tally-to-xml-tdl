import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { executeXmlAndClean } from "../core/index.js";
import { buildXml } from "../core/buildXml.js";
import tdlJson from "./tdl.json" with {type: "json"};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const body = fs.readFileSync(path.join(__dirname, "body.xml"), "utf8");

const startFunc = async (showLog = false) => {
    const xml = buildXml(body, {
        tdlJson
    });

    if (showLog) console.log("xml : ", xml);

    const jsonToReturn = await executeXmlAndClean(xml);

    if (showLog) console.log("jsonToReturn : ", jsonToReturn);

    return jsonToReturn;
};

export default startFunc;