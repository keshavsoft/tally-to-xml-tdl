// src/v4/core/execute/executeXml.js
import { sendXml } from "../transport/http.js";
import { xmlToJson } from "../response/xmlToJson.js";

const startFunc = async (
    xml,
    { url = "http://localhost:9000" } = {}
) => {
    const rawXml = await sendXml({ xml, url });

    const json = xmlToJson(rawXml);
// console.log("json :", json);
    return json;
};

export default startFunc;