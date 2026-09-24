import { xmlToJson } from "../response/xmlToJson.js";

/**
 * Sends a raw XML string to Tally via HTTP POST and returns the raw response text.
 * 
 * @param {object} params
 * @param {string} params.xml - The XML payload to send.
 * @param {string} [params.url="http://localhost:9000"] - Tally HTTP endpoint URL.
 * @returns {Promise<string>} Raw XML response text from Tally.
 */
export const sendXml = async ({
    xml,
    url = "http://localhost:9000"
} = {}) => {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml"
        },
        body: xml
    });

    return await res.text();
};

/**
 * Sends an XML payload to Tally via HTTP POST and parses the response to JSON.
 * 
 * @param {object} params
 * @param {string} params.xml - The XML string to send.
 * @param {string} [params.url="http://localhost:9000"] - Tally HTTP endpoint URL.
 * @returns {Promise<object>} Parsed JSON response from Tally.
 */
export const sendToTally = async ({
    xml,
    url = "http://localhost:9000"
} = {}) => {
    const text = await sendXml({ xml, url });
    return xmlToJson(text);
};
