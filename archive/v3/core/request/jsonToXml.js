import { XMLBuilder } from "fast-xml-parser";

/**
 * Converts a JavaScript Object into a formatted XML string.
 * Preserves XML attributes prefixed with `@_`.
 * 
 * @param {object} jsonObj - The JavaScript object to serialize.
 * @param {object} [options] - Optional XMLBuilder configurations.
 * @returns {string} Formatted XML string.
 */
export const jsonToXml = (jsonObj, options = {}) => {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        ...options
    });

    return builder.build(jsonObj);
};
