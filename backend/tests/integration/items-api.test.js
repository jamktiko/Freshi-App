import request from 'supertest';
import app from '../../app.js';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe('Items API - Full CRUD Flow', () => {
  let createdItemId = 'ITEM#dummy123';
  
  beforeEach(() => {
    dynamoMock.reset();
  });
  
  test('POST /items — creates a new product with Flour 2027-01-01', async () => {
    dynamoMock.on(PutCommand).resolves({}); // Mock successful insert
    
    const res = await request(app)
      .post('/items')
      .set('x-user-id', 'test-user-123')
      .send({ productName: 'Flour', expirationDate: '2027-01-01' });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('itemId');
    createdItemId = res.body.data.itemId; // Dynamically save ID for later tests
  });
  
  test('GET /items — verifies the created product appears in the list', async () => {
    dynamoMock.on(QueryCommand).resolves({
      Items: [{ itemId: createdItemId, productName: 'Flour', expirationDate: '2027-01-01' }]
    });
    
    const res = await request(app)
      .get('/items')
      .set('x-user-id', 'test-user-123');
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].itemId).toBe(createdItemId);
  });
  
  test('PUT /items/:id — changes the expiration date to 2026-06-01', async () => {
    dynamoMock.on(UpdateCommand).resolves({
      Attributes: { itemId: createdItemId, productName: 'Flour', expirationDate: '2026-06-01' }
    });
    
    const res = await request(app)
      .put(`/items/${createdItemId}`)
      .set('x-user-id', 'test-user-123')
      .send({ productName: 'Flour', expirationDate: '2026-06-01' });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expirationDate).toBe('2026-06-01');
  });
  
  test('DELETE /items/:id — removes the product', async () => {
    dynamoMock.on(DeleteCommand).resolves({});
    
    const res = await request(app)
      .delete(`/items/${createdItemId}`)
      .set('x-user-id', 'test-user-123');
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
