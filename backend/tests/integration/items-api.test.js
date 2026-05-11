import request from 'supertest';
import app from '../../app.js';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const dynamoMock = mockClient(DynamoDBDocumentClient);

/**
 * Each test is fully independent — uses its own hardcoded item ID
 * and provides its own DynamoDB mock response. No shared state
 * between tests (the previous version cascaded `createdItemId`
 * from POST to GET/PUT/DELETE).
 */
describe('Items API - CRUD Operations', () => {
  
  beforeEach(() => {
    dynamoMock.reset();
  });
  
  // ─── POST /items ────────────────────────────────────────────

  test('POST /items — creates a new product', async () => {
    dynamoMock.on(PutCommand).resolves({});
    
    const res = await request(app)
      .post('/items')
      .set('x-user-id', 'test-user-123')
      .send({ productName: 'Flour', expirationDate: '2027-01-01' });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('itemId');
  });

  test('POST /items — returns 400 when productName is missing', async () => {
    const res = await request(app)
      .post('/items')
      .set('x-user-id', 'test-user-123')
      .send({ expirationDate: '2027-01-01' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /items — returns 400 when expirationDate is missing', async () => {
    const res = await request(app)
      .post('/items')
      .set('x-user-id', 'test-user-123')
      .send({ productName: 'Flour' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /items — returns 400 when expirationDate format is invalid', async () => {
    const res = await request(app)
      .post('/items')
      .set('x-user-id', 'test-user-123')
      .send({ productName: 'Flour', expirationDate: 'not-a-date' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/YYYY-MM-DD/);
  });

  // ─── GET /items ─────────────────────────────────────────────

  test('GET /items — returns products for the user', async () => {
    const TEST_ITEM_ID = 'ITEM#get-test-001';

    dynamoMock.on(QueryCommand).resolves({
      Items: [{ itemId: TEST_ITEM_ID, productName: 'Flour', expirationDate: '2027-01-01' }]
    });
    
    const res = await request(app)
      .get('/items')
      .set('x-user-id', 'test-user-123');
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].itemId).toBe(TEST_ITEM_ID);
  });
  
  // ─── PUT /items/:id ─────────────────────────────────────────

  test('PUT /items/:id — updates an existing product', async () => {
    const TEST_ITEM_ID = 'ITEM#put-test-001';

    dynamoMock.on(UpdateCommand).resolves({
      Attributes: { itemId: TEST_ITEM_ID, productName: 'Flour', expirationDate: '2026-06-01' }
    });
    
    const res = await request(app)
      .put(`/items/${TEST_ITEM_ID}`)
      .set('x-user-id', 'test-user-123')
      .send({ productName: 'Flour', expirationDate: '2026-06-01' });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expirationDate).toBe('2026-06-01');
  });
  
  // ─── DELETE /items/:id ──────────────────────────────────────

  test('DELETE /items/:id — removes a product', async () => {
    const TEST_ITEM_ID = 'ITEM#delete-test-001';

    dynamoMock.on(DeleteCommand).resolves({});
    
    const res = await request(app)
      .delete(`/items/${TEST_ITEM_ID}`)
      .set('x-user-id', 'test-user-123');
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
