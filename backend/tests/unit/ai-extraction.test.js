import { analyzeText } from '../../services/ai-extraction.service.js';

describe('AI Extraction Service (Bedrock)', () => {
  // This test is skipped for now until the team finishes merging bedrock.service.js
  // and ai-extraction.service.js logic.
  test.skip('should correctly parse valid JSON returned from Bedrock', async () => {
    // TODO: Setup aws-sdk-client-mock here to avoid hitting real Bedrock
    // mockBedrockClient.on(ConverseCommand).resolves({...});
    
    const result = await analyzeText('Oatly Oat Milk 2026-05-01');
    expect(result).toHaveProperty('productName');
    expect(result).toHaveProperty('brand');
  });

  test.skip('should throw an error gracefully if Bedrock returns invalid JSON', async () => {
    // TODO: Mock Bedrock to return malformed string
    await expect(analyzeText('invalid')).rejects.toThrow('AI returned invalid JSON');
  });
});
