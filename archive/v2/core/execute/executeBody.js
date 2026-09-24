import { jsonToXml } from "../request/jsonToXml.js";
import { sendXml } from "../transport/http.js";

const executeBody = async (body, {
    full = false,
    url = "http://localhost:9000"
} = {}) => {
    // Act 1: Request (Formulating what to send)
    let xml;
    if (body.ENVELOPE) {
        xml = jsonToXml(body);
    };

    // console.log("--------- : ", xml);
    // Act 2: Transport (Sending over the wire)
    const rawXml = await sendXml({ xml, url });


    return rawXml;
};

export default executeBody;

