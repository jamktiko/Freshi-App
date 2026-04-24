import { createItem, getItemsByUser } from "./services/dynamo.service.js";

const userId = "test-user";

// test insert
await createItem({
  PK: `USER#${userId}`,
  SK: `ITEM#${Date.now()}`,
  productName: "Banana",
  brand: "Chiquita"
});

// test fetch
const items = await getItemsByUser(userId);

console.log(items);