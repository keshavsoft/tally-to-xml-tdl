/**
 * The Story of Tally Type Conversion:
 *
 * Act 1 - The XML Artifacts:
 *   Tally XML represents typed primitive fields with attributes such as `@_TYPE="String"`,
 *   `@_TYPE="Date"`, or `@_TYPE="Logical"`. The XML parser converts these tags into
 *   objects where `#text` holds the actual content and `@_TYPE` holds the data type.
 *   Tags with empty content (e.g. <SERIALMASTER TYPE="String"/>) result in objects
 *   containing only `@_TYPE` without a `#text` key.
 *
 * Act 2 - The String Story:
 *   When `@_TYPE === "String"`, we extract `#text` as a clean string.
 *   If `#text` is missing (empty element), we normalize it to an empty string `""`
 *   rather than keeping the unparsed metadata object.
 *
 * Act 3 - The Date Story:
 *   When `@_TYPE === "Date"`, Tally returns dates in YYYYMMDD format (e.g., 20260904).
 *   XML parsers often parse this as a numeric literal (20260904). We safely normalize
 *   this into a clean string representation `'20260904'` for consistent date formatting.
 *
 * Act 4 - Logical & Other Primitives:
 *   When `@_TYPE === "Logical"` (values like 'Yes' / 'No') or other typed fields,
 *   we unwrap `#text` to its plain scalar value while leaving nested child arrays
 *   (e.g., inventory lines, ledger entries) intact.
 */

/**
 * Normalizes a single field value based on its Tally XML type.
 *
 * @param {object} params
 * @param {*} params.inValue - The field value to inspect and transform.
 * @returns {*} The cleaned scalar or original complex structure.
 */
const handleValue = ({ inValue }) => {
    const localValue = inValue;

    // Preserve null, undefined, primitives, and nested arrays (e.g. ALLINVENTORYENTRIES.LIST)
    if (!localValue || typeof localValue !== "object" || Array.isArray(localValue)) {
        return localValue;
    }

    // Process Tally typed objects with @_TYPE
    if ("@_TYPE" in localValue) {
        const type = localValue["@_TYPE"];
        const hasText = "#text" in localValue;
        const rawText = localValue["#text"];

        // Act 2 fallback: Empty tags (<FIELD TYPE="..."/>) have no #text
        if (!hasText) {
            return "";
        }

        switch (type) {
            // Act 2: String types
            case "String":
                return String(rawText);

            // Act 3: Date types (normalize numbers like 20260904 to string '20260904')
            case "Date":
                return String(rawText);

            // Act 4: Logical types ('Yes' / 'No')
            case "Logical":
                return String(rawText);

            // Other types (Number, Amount, Rate, etc.)
            default:
                return rawText;
        }
    }

    return localValue;
};

/**
 * Transforms an array of rows by converting Tally typed objects into clean values.
 *
 * @param {object|Array} input - Either { inArray: Array } or positional Array.
 * @returns {Array} Array of cleaned rows.
 */
const changeTypeString = (input) => {
    // Supports both { inArray } parameter convention and direct array argument
    let localArray = Array.isArray(input) ? input : input?.inArray;

    if (!localArray) {
        return [];
    }

    if (!Array.isArray(localArray)) {
        localArray = [localArray];
    }

    const newArray = localArray.map(row => {
        if (!row || typeof row !== "object") {
            return row;
        }

        const result = {};

        for (const [key, value] of Object.entries(row)) {
            result[key] = handleValue({ inValue: value });
        }

        return result;
    });

    return newArray;
};

export default changeTypeString;
export { changeTypeString };
