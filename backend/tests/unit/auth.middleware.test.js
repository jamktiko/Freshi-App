import { jest } from '@jest/globals';
import { requireAuth } from '../../middleware/auth.middleware.js';

describe('Auth Middleware (requireAuth)', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
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
  });

  test('returns 401 if no Authorization or x-user-id header is provided', () => {
    requireAuth(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('calls next() and attaches decoded user if x-user-id header is valid', () => {
    mockRequest.headers['x-user-id'] = 'user-123';

    requireAuth(mockRequest, mockResponse, nextFunction);

    expect(mockRequest.user).toEqual({ sub: 'user-123' });
    expect(nextFunction).toHaveBeenCalled();
  });

  test('calls next() and attaches decoded user if valid Bearer token is provided', () => {
    // A dummy base64 encoded JWT token where the payload contains {"sub":"user-456"}
    const dummyPayload = Buffer.from(JSON.stringify({ sub: 'user-456' })).toString('base64');
    const dummyToken = `header.${dummyPayload}.signature`;
    mockRequest.headers.authorization = `Bearer ${dummyToken}`;

    requireAuth(mockRequest, mockResponse, nextFunction);

    expect(mockRequest.user).toEqual({ sub: 'user-456' });
    expect(nextFunction).toHaveBeenCalled();
  });
  
  test('returns 401 if Bearer token is malformed', () => {
    mockRequest.headers.authorization = `Bearer invalid-token-string`;

    requireAuth(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
