export const buildXml = (body, {
    staticVariables = "",
    tdlMessage
}) => {

    return body
        .replace("{{STATICVARIABLES}}", staticVariables)
        .replace("{{TDLMESSAGE}}", tdlMessage);
};