import { jest } from '@jest/globals';
import { mockClient } from 'aws-sdk-client-mock';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { analyzeOCRText } from '../services/bedrock.service.js';

// This is the magic! It completely hijacks the Bedrock client
// so NO network requests are made, and NO AWS costs are incurred!
const bedrockMock = mockClient(BedrockRuntimeClient);

describe('Bedrock AI Service', () => {
    beforeEach(() => {
        bedrockMock.reset();
    });

    it('should successfully parse a valid Bedrock JSON response completely for free', async () => {
        // Arrange: Fake the Bedrock Response natively, hitting NO cloud resources!
        bedrockMock.on(ConverseCommand).resolves({
            output: {
                message: {
                    content: [{
                        text: '{"productName": "Milk", "brand": "VALIO", "expirationDate": "2026-05-10"}'
                    }]
                }
            }
        });

        // Act: Run our code
        const result = await analyzeOCRText("Valio Milk 1L EXP 10.05.2026");

        // Assert: It should perfectly map the JSON
        expect(result.productName).toBe("Milk");
        expect(result.brand).toBe("VALIO");
        expect(result.expirationDate).toBe("2026-05-10");
        
        // Assert: Ensure it only called our fake mock client!
        expect(bedrockMock.calls()).toHaveLength(1);
    });
});
