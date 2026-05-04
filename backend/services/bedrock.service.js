import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || "eu-central-1" });

export const analyzeOCRText = async (rawOcrText) => {
    const promptText = `
    Analyze the following text extracted from a product label via OCR.
    Identify the food product name, brand, and expiration date if visible.
    
    OCR Text:
    "${rawOcrText}"
    
    Return ONLY a strict JSON object:
    {
      "productName": "string",
      "brand": "string | null",
      "expirationDate": "string (YYYY-MM-DD) | null"
    }`;

    try {
        const response = await bedrock.send(new ConverseCommand({
            modelId: process.env.BEDROCK_MODEL_ID || "eu.amazon.nova-2-lite-v1:0",
            messages: [{ role: "user", content: [{ text: promptText }] }]
        }));
        
        const jsonString = response.output.message.content[0].text;
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Bedrock Error:", error);
        throw new Error("Failed to analyze text");
    }
};

export { bedrock }; // Export client strictly for mocked testing purposes
