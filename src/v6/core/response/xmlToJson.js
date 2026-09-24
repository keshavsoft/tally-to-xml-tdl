import { XMLParser } from "fast-xml-parser";

/**
 * Converts XML string into a JavaScript Object.
 * Preserves XML attributes using the `@_` prefix.
 * 
 * @param {string} xml - The XML string to parse.
 * @param {object} [options] - Optional XMLParser configurations.
 * @returns {object} The parsed JavaScript object.
 */
export const xmlToJson = (xml, options = {}) => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        ...options
    });

    return parser.parse(xml);
};
