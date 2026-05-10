import { jest } from '@jest/globals';
import { requireApiGatewaySecret } from '../../middleware/auth.middleware.js';

describe('requireApiGatewaySecret middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  const REAL_SECRET = 'my-super-secret-key';

  beforeEach(() => {
    // Set the env var the middleware checks against
    process.env.API_GATEWAY_SECRET = REAL_SECRET;

    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.API_GATEWAY_SECRET;
  });

  test('returns 403 if x-api-gateway-secret header is missing', () => {
    requireApiGatewaySecret(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Forbidden',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('returns 403 if x-api-gateway-secret header has wrong value', () => {
    mockRequest.headers['x-api-gateway-secret'] = 'wrong-secret';

    requireApiGatewaySecret(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Forbidden',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('calls next() if x-api-gateway-secret header matches', () => {
    mockRequest.headers['x-api-gateway-secret'] = REAL_SECRET;

    requireApiGatewaySecret(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});
