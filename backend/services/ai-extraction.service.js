// Import AWS Bedrock runtime client used to call foundation models (e.g. Nova Lite)
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

// Create a Bedrock client instance configured with AWS region from environment variables
const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION
});

/**
 * 🤖 AI analysis function (ONLY returns suggestion, does NOT store anything)
 *
 * @param {string} rawOcrText - Text extracted from product image via OCR
 * @returns {Promise<Object>} - Structured product suggestion from AI
 */
export async function analyzeText(rawOcrText) {

  // Prompt sent to AI model to instruct strict JSON output format
  const prompt = `
Extract product info from OCR text.

Return JSON ONLY:
{
  "productName": string,
  "brand": string|null,
  "expirationDate": string|null,
  "confidence": number
}

OCR:
${rawOcrText}
`;

  // Send request to Amazon Bedrock model
  const res = await bedrock.send(
    new ConverseCommand({
      modelId: process.env.BEDROCK_MODEL_ID, // AI model identifier (Nova Lite)
      messages: [
        {
          role: "user", // user role message sent to LLM
          content: [{ text: prompt }] // actual prompt content
        }
      ],
      inferenceConfig: {
        temperature: 0.1 // low randomness for consistent structured output
      }
    })
  );

  // Extract raw text response from AI model output structure
  const text = res.output.message.content[0].text;

  // Convert AI response string into JSON object
  return JSON.parse(text);
}