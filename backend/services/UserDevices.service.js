// DynamoDB low-level client
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// DynamoDB DocumentClient for working with normal JS objects
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

/** 
 * Initialize DynamoDB client
 */
const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });

/**
 * Wrap with DocumentClient for easier handling of JSON objects in DynamoDB operations
 */
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

/**
 * TTL configuration
 * Devices expire after 90 days of inactivity
 */
const DEVICE_TTL_DAYS = 90;

/**
 * Register or update a device for a user.
 * 
 * The way this works is:
 * -if same device (deviceId) already exists for the user, we update the record with new token and refresh TTL
 * -if new device, we create a new record for it
 */
export async function saveDevice ({
    userId,
    deviceId,
    deviceType,
    fcmToken
}) {
    const now = new Date();

    /**
     * TTL in seconds (required by DynamoDB)
    */
    const ttl = Math.floor(
        (now.getTime() + 
        DEVICE_TTL_DAYS * 24 * 60 * 60 * 1000) / 1000);
    
    const item = {
        UserId: userId,           // Partition Key
        DeviceId: deviceId,      // Sort Key
        deviceType,  // eg. "Android" or "iOS"
        fcmToken,      // FCM token for push notifications
        lastActiveDate: now.toISOString(), // For TTL management    
        TTL: ttl // TTL attribute for DynamoDB
    };

        // Save or update the device record in DynamoDB
    await docClient.send(
        new PutCommand({
            TableName: process.env.DEVICES_TABLE_NAME,
            Item: item
        })
    );

    return item;
}

/**
 * GET ALL DEVICES FOR A USER
 * 
 * This function retrieves all devices registered for a specific user.
 * 
 */

export async function getDevicesForUser (userId) {
    const res = await docClient.send(
        new QueryCommand({
            TableName: process.env.DEVICES_TABLE_NAME,

            //Key condition to query by UserId (partition key)
            KeyConditionExpression: "UserId = :uid",
            //Expression attribute values for the query
            ExpressionAttributeValues: {
                ":uid": userId
            }
        })
    );

    //return the list of devices or an empty array if none found
    return res.Items || [];
}

/** 
 * REMOVE A DEVICE
 * 
 * This function deletes a specific device for a user based on the deviceId.
 * Called when a user logs out from a device or wants to remove it from their account.
 */
export async function deleteDevice(userId, deviceId) {
    await docClient.send(
        new DeleteCommand({
            TableName: process.env.DEVICES_TABLE_NAME,

            //Key to identify the specific device record to delete
            Key: {
                UserId: userId,
                DeviceId: deviceId
            }
        })
    );
    //return true to indicate successful deletion
    return true;
}

/**
 * UPDATE DEVICE ACTIVITY
 * 
 * Refresh: 
 * -lastActiveDate to current time
 * -refresh TTL to extend the device's validity in DynamoDB
 */
export async function refreshDevice(userId, deviceId) {
    const now = new Date();

    //TTL in seconds (required by DynamoDB)
    const ttl = Math.floor(
        (now.getTime() + 
        DEVICE_TTL_DAYS * 24 * 60 * 60 * 1000) / 1000);

    await docClient.send(
        new UpdateCommand({
            TableName: process.env.DEVICES_TABLE_NAME,

            //Key to identify the specific device record to update:
            Key: {
                UserId: userId,
                DeviceId: deviceId
            },

            UpdateExpression: `
                SET lastActiveDate = :la,
                    TTL = :ttl
            `,
            ExpressionAttributeValues: {
                ":la": now.toISOString(),
                ":ttl": ttl
            }
        })
    );
    //return true to indicate successful update
    return true;
}

/**
 * GET TOKENS ONLY
 * 
 * Returns only FCM tokens for a user's devices, used when sending push notifications.
 */
export async function getUserPushTokens (userId) {
    const devices = await getDevicesForUser(userId);

    // Extract and return only the device tokens (if they exist)
    return devices
        .map(device => device.fcmToken) // Return an array of tokens
        .filter(Boolean); // Filter out any falsy values
}