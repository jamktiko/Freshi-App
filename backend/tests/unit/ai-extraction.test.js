import { analyzeText } from '../../services/ai-extraction.service.js';
import { mockClient } from 'aws-sdk-client-mock';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockMock = mockClient(BedrockRuntimeClient);

describe('AI Extraction Service (Bedrock)', () => {
  beforeEach(() => {
    bedrockMock.reset();
  });

  // This test is skipped for now until the team finishes merging bedrock.service.js
  // and ai-extraction.service.js logic.
  test.skip('should correctly parse valid JSON returned from Bedrock', async () => {
    bedrockMock.on(ConverseCommand).resolves({
      output: {
        message: {
          content: [{ text: '{"productName": "Oatly Oat Milk", "brand": "Oatly", "expirationDate": "2026-05-01"}' }]
        }
      }
    });
    
    const result = await analyzeText('Oatly Oat Milk 2026-05-01');
    expect(result).toHaveProperty('productName', 'Oatly Oat Milk');
    expect(result).toHaveProperty('brand', 'Oatly');
  });

  test.skip('should throw an error gracefully if Bedrock returns invalid JSON', async () => {
    bedrockMock.on(ConverseCommand).resolves({
      output: {
        message: {
          content: [{ text: 'invalid json response' }]
        }
      }
    });

    await expect(analyzeText('invalid')).rejects.toThrow('AI returned invalid JSON');
  });
});
