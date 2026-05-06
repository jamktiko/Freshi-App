import request from 'supertest';
// import app from '../../app.js'; // Ensure app is exported and imported here

describe('Items API - Full CRUD Flow', () => {
  let createdItemId;
  
  test.skip('POST /items — creates a new product with Flour 2027-01-01', async () => {
    // const res = await request(app).post('/items').send({ name: 'Flour', expiry: '2027-01-01' });
    // expect(res.status).toBe(201);
    // expect(res.body).toHaveProperty('id');
    // createdItemId = res.body.id;
  });
  
  test.skip('GET /items — verifies the created product appears in the list', async () => {
    // const res = await request(app).get('/items');
    // expect(res.status).toBe(200);
    // expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: createdItemId })]));
  });
  
  test.skip('PUT /items/:id — changes the expiration date to 2026-06-01', async () => {
    // const res = await request(app).put(`/items/${createdItemId}`).send({ expiry: '2026-06-01' });
    // expect(res.status).toBe(200);
  });
  
  test.skip('DELETE /items/:id — removes the product', async () => {
    // const res = await request(app).delete(`/items/${createdItemId}`);
    // expect(res.status).toBe(200);
  });
  
  test.skip('GET /items — verifies the product no longer appears after deletion', async () => {
    // const res = await request(app).get('/items');
    // expect(res.status).toBe(200);
    // expect(res.body.find(item => item.id === createdItemId)).toBeUndefined();
  });

});
