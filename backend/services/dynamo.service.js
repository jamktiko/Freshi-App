// Import AWS DynamoDB low-level client (connection layer)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Import higher-level DocumentClient (works with normal JSON objects)
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

// Create raw DynamoDB client with AWS region configuration
const client = new DynamoDBClient({
  region: process.env.AWS_REGION
});

// Wrap it with DocumentClient for easier JS object handling
const docClient = DynamoDBDocumentClient.from(client);

// GET ALL ITEMS FOR A USER

/**
 * Fetch all items belonging to a specific user
 * Uses partition key: PK = USER#<userId>
 */
export async function getItemsByUser(userId) {

  const res = await docClient.send(
    new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE,

      // Only fetch items for this user partition
      KeyConditionExpression: "PK = :pk",

      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`
      }
    })
  );

  return res.Items || [];
}


/**
 * Save a new item into DynamoDB
 */
export async function createItem(item) {

  await docClient.send(
    new PutCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: item
    })
  );

  return item;
}


/**
 * Update an existing item in DynamoDB
 */
export async function updateItem(userId, itemId, updates) {

  const res = await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,

      Key: {
        PK: `USER#${userId}`,
        SK: itemId
      },

      // Example update fields
      UpdateExpression:
        "SET productName = :p, brand = :b, expirationDate = :e",

      ExpressionAttributeValues: {
        ":p": updates.productName,
        ":b": updates.brand,
        ":e": updates.expirationDate
      },

      ReturnValues: "ALL_NEW"
    })
  );

  return res.Attributes;
}


/**
 * Delete an item from DynamoDB
 */
export async function deleteItem(userId, itemId) {

  await docClient.send(
    new DeleteCommand({
      TableName: process.env.DYNAMODB_TABLE,

      Key: {
        PK: `USER#${userId}`,
        SK: itemId
      }
    })
  );

  return true;
}