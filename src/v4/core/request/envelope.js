import { jsonToXml } from "./jsonToXml.js";

/**
 * Creates a base Tally XML Envelope JavaScript Object.
 * 
 * @param {object} [params]
 * @param {string} [params.id=""] - Collection or Request ID
 * @param {string} [params.type="COLLECTION"] - Request Type (default "COLLECTION")
 * @param {object} [params.staticVariables] - Static variables for DESC
 * @param {object} [params.tdlMessage] - Object to place inside TDLMESSAGE
 * @returns {object} Tally Envelope JS Object
 */
export const createEnvelope = ({
    id = "",
    type = "COLLECTION",
    staticVariables = { SVEXPORTFORMAT: "$$SysName:XML" },
    tdlMessage = {}
} = {}) => {
    return {
        ENVELOPE: {
            HEADER: {
                VERSION: 1,
                TALLYREQUEST: "EXPORT",
                TYPE: type,
                ID: id
            },
            BODY: {
                DESC: {
                    STATICVARIABLES: staticVariables,
                    TDL: {
                        TDLMESSAGE: tdlMessage
                    }
                }
            }
        }
    };
};

/**
 * Creates a Tally Collection Request Envelope object.
 * 
 * @param {object} params
 * @param {string} params.name - Collection name (used for ID and COLLECTION NAME)
 * @param {string} params.type - Tally Object Type (e.g. 'Group', 'Ledger', 'Company')
 * @param {string|string[]} [params.fields] - Field names to FETCH
 * @param {object} [params.filters] - Additional collection child nodes or filters
 * @param {object} [params.staticVariables] - Static variables for DESC
 * @returns {object} Tally Envelope JS Object
 */
export const createCollectionEnvelope = ({
    name,
    type,
    fields = [],
    filters = {},
    staticVariables = { SVEXPORTFORMAT: "$$SysName:XML" }
} = {}) => {
    const fetchValue = Array.isArray(fields)
        ? fields.join(",\n        ")
        : (fields || "");

    const collectionDef = {
        "@_NAME": name,
        TYPE: type,
        ...(fetchValue ? { FETCH: fetchValue } : {}),
        ...filters
    };

    return createEnvelope({
        id: name,
        type: "COLLECTION",
        staticVariables,
        tdlMessage: {
            COLLECTION: collectionDef
        }
    });
};

/**
 * Helper to build an XML string directly for a collection query.
 * 
 * @param {object} options - Options passed to createCollectionEnvelope
 * @returns {string} XML string ready to send to Tally
 */
export const buildCollectionXml = (options) => {
    return jsonToXml(createCollectionEnvelope(options));
};
