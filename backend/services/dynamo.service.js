// Import AWS DynamoDB low-level client (connection layer)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Import higher-level DocumentClient (works with normal JSON objects)
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
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
 * Uses partition key: UserId
 */
export async function getItemsByUser(userId, lastKey = undefined) {

  const res = await docClient.send(
    new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE,

      // Only fetch items for this user partition
      KeyConditionExpression:
       "userId = :uid",

       // Only return items that are not marked as deleted
      FilterExpression: "isDeleted = :false",
       

      ExpressionAttributeValues: {
        ":uid": userId,
        ":false": false
      },
      ExclusiveStartKey: lastKey // For pagination ()
    })
  );

  return {
    items: res.Items || [],
    lastKey: res.LastEvaluatedKey
  }; // For pagination (if there are more items to fetch)
}


/**
 * CREATE ITEM
 * Save a new item into DynamoDB
 */
export async function createItem(item) {

  await docClient.send(
    new PutCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: item,
      ConditionExpression: "attribute_not_exists(userId) AND attribute_not_exists(itemId)" // Ensure no item with same PK+SK exists (basic idempotency)

    })
  );

  return item;
}


/**
 * UPDATE ITEM
 * Update an existing item in DynamoDB
 */
export async function updateItem(userId, itemId, updates) {
  const now = new Date().toISOString();

  const res = await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,

      Key: {
        userId: userId,
        itemId: itemId
      },

      /**
       * UpdateExpression defines which attributes to update and how.
       * 
       * We want to update:
       * - productName
       * - brand
       * - expirationDate
       * - lastUpdate
       */ 
      UpdateExpression: `
        SET productName = :p,
            brand = :b, 
            expirationDate = :e, 
            lastUpdate = :lu
      `,

      ExpressionAttributeValues: {
        ":p": updates.productName,
        ":b": updates.brand,
        ":e": updates.expirationDate,
        ":lu": now
      },

      // Return the updated item after the update operation
      ReturnValues: "ALL_NEW"
    })
  );

  return res.Attributes;
}


/**
 * SOFT DELETE ITEM
 * Mark an item as deleted in DynamoDB
 * Keep it for sync purposes but set IsDeleted flag to true and update lastUpdate timestamp
 */
export async function deleteItem(userId, itemId) {
  const now = new Date().toISOString();

  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,

      Key: {
        userId: userId,
        itemId: itemId
      },

      UpdateExpression: `
        SET isDeleted = :d, 
            lastUpdate = :lu
      `,
      ExpressionAttributeValues: {
        ":d": true,
        ":lu": now
      }
    })
  );

  return true;
}

/**
 * DELTA SYNC (GSI: LastUpdateIndex)
 * Fetch items that have been created, updated, or deleted since the last sync timestamp
 * Uses GSI:
 * - Partition Key: UserId
 * - Sort Key: lastUpdate (ISO timestamp string)
 * 
 * This enables efficient mobile sync.
 */
export async function getUpdatedItems(userId, lastSyncTimestamp) {
  const res = await docClient.send(
    new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE,
      IndexName: "LastUpdateIndex",

      KeyConditionExpression: "userId = :uid AND lastUpdate > :ls",

      ExpressionAttributeValues: {
        ":uid": userId,
        ":ls": lastSyncTimestamp
      }
    })
  );

  return res.Items || [];
}

/**
 * Notification Query (GSI: NotificationQueryIndex)
 * Fetch items that are expiring soon and haven't been notified yet
 * Uses GSI:
 * - Partition Key: NotificationStatus (PENDING or SENT)
 * - Sort Key: expirationDate (ISO date string)
 * 
 * This enables efficient querying for the notification Lambda to find items that need notifications.
 */
/*
export async function getItemsForNotification(targetDate) {
  const res = await docClient.send(
    new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE,

      
      IndexName: "NotificationQueryIndex",

      KeyConditionExpression:
       "notificationStatus = :ns AND expirationDate <= :date",

      ExpressionAttributeValues: {
        ":ns": "PENDING",
    
        ":date": targetDate
      }
    })
  );
 */

return res.Items || []; //return items

