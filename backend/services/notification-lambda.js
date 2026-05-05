/*

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// ⚠️ IMPORTANT: To deploy this actual logic to Lambda, the backend developer
// needs to run `npm install firebase-admin` in this directory, zip the folder, 
// and upload it to the 'FreshiNotificationSender' Lambda function via the AWS Console or CI/CD.
// const admin = require('firebase-admin');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const secretsClient = new SecretsManagerClient({});

exports.handler = async (event) => {
    console.log("Firebase Notification Lambda triggered via EventBridge!");
    
    // 1. Get Firebase Credentials securely from Secrets Manager
    const secretResponse = await secretsClient.send(new GetSecretValueCommand({
        SecretId: process.env.SECRET_NAME
    }));
    const serviceAccount = JSON.parse(secretResponse.SecretString);
    
    // TODO: Developer initializes firebase-admin here:
    // if (!admin.apps.length) { admin.initializeApp({ credential: admin.credential.cert(serviceAccount) }); }

    // 2. Query DynamoDB for items expiring in the next 3 days that haven't been notified yet
    const today = new Date();
    today.setDate(today.getDate() + 3);
    const targetDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const { Items } = await docClient.send(new QueryCommand({
        TableName: process.env.PRODUCTS_TABLE,
        IndexName: 'NotificationQueryIndex',
        KeyConditionExpression: "notificationStatus = :status AND expirationDate <= :date",
        ExpressionAttributeValues: {
            ":status": "PENDING",
            ":date": targetDate
        }
    }));

    if (!Items || Items.length === 0) {
        console.log("No items expiring soon. Exiting.");
        return { statusCode: 200, body: 'No notifications needed.' };
    }

    // 3. Group expiring items by UserId
    const userItems = {};
    for (const item of Items) {
        if (!userItems[item.UserId]) userItems[item.UserId] = [];
        userItems[item.UserId].push(item);
    }

    // 4. Fetch device tokens and send notifications
    for (const [userId, products] of Object.entries(userItems)) {
        // Fetch the user's active mobile devices from the UserDevices table
        const { Item: userDeviceRecord } = await docClient.send(new GetCommand({
            TableName: process.env.DEVICES_TABLE,
            Key: { UserId: userId }
        }));

        if (userDeviceRecord && userDeviceRecord.DeviceTokens) {
            const tokens = userDeviceRecord.DeviceTokens;
            console.log(`Sending Firebase notification to ${userId} for ${products.length} items...`);
            
            // TODO: Developer writes actual Firebase FCM send logic here:
            // const message = {
            //     notification: { title: "Food Expiring Soon!", body: `You have ${products.length} items expiring.` },
            //     tokens: tokens
            // };
            // await admin.messaging().sendMulticast(message);
            
            // 5. Update DynamoDB to mark items as SENT so we don't spam the user tomorrow
            for (const product of products) {
                await docClient.send(new UpdateCommand({
                    TableName: process.env.PRODUCTS_TABLE,
                    Key: { UserId: userId, ItemId: product.ItemId },
                    UpdateExpression: "SET NotificationStatus = :sent",
                    ExpressionAttributeValues: { ":sent": "SENT" }
                }));
            }
        }
    }

    console.log("All notifications processed successfully.");
    return { statusCode: 200, body: 'Notifications sent' };
};

*/
