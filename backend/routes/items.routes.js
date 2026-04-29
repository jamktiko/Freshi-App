import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import { 
  createItem,
  getUpdatedItems,
  getItemsByUser,
  updateItem,
  deleteItem
 } from "../services/dynamo.service.js";

const router = express.Router();

router.use(requireAuth); // Apply authentication middleware to all item routes

/**
 * Helper for getting userid
 * During development, we return a default test user
 * In production, this should extract the user ID from the authentication token (e.g. Cognito JWT) using auth middleware
*/

function getUserId(req) {
  return req.user.sub; // requireAuth middleware will populate req.user with the decoded JWT token, which contains the user's sub (unique identifier)
}

//authMiddleware, // Uncomment this line to enable authentication for item routes
/** 
 * POST /
 * Create a new food item for a user
 * Expected:
 * - req.user.sub (user ID from auth middleware) off as of now due to testing without authentication
 * - req.body: contains iten data
 */
router.post(
  "/", 
  async (req, res) => {
  try {
    //Extract user ID from authentucation token
    const userId = getUserId(req); // Use "test-user" if authentication is not set up yet

    /* if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    */

    const {
      S3imageKey,
      productName,
      brand,
      expirationDate,
      confidence
    } = req.body;

    if (!productName || !expirationDate) {
      return res.status(400).json({ error: "Missing required fields" 
      });
    }

    if (
      typeof productName !== "string" || 
      typeof expirationDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)
    ) {
      return res.status(400).json({
        error: "expirationDate must be in YYYY-MM-DD format and productName must be a string"
      });
    }

    const now = new Date();

    //Unique item identifier (Sort Key)
    const itemId = `ITEM#${Date.now()}#${Math.random()
      .toString(36)
      .slice(2, 8)}`; // item ID format: ITEM#timestamp#randomString (e.g., ITEM#1634567890123#abc123) for uniqueness and sorting by creation time

    /**
     * TTL (Time To Live)
     * DynamoDB expects TTL as Unix epoch time in seconds. We convert the expiration date to this format.
     * Here:
     * Validate that expirationDate is a valid date string
     * The ttl takes expirationDate
     * Adds 30 days
     * Converts to Unix epoch time in seconds
     *
    */
    const expDate = new Date(expirationDate);
    
    if (isNaN(expDate.getTime())) {
      return res.status(400).json({ error: "Invalid expiration date format" });
    }

    const ttl = Math.floor(
      (expDate.getTime() + 30 * 24 * 60 * 60 * 1000) / 1000);


    /**
     * DynamoDB Item Structure:
     * Partition Key = User ID
     * Sort Key = Item ID
     * Other attributes: imageKey, productName, brand, expirationDate, confidence, createdAt
     */
    const item = {
      UserId: userId, // Partition Key for querying items by user
      ItemId: itemId,
      S3imageKey, // S3 key for the uploaded image (if applicable)
      productName, // Required product name field from image recognition
      brand, // Optional brand field from image recognition
      expirationDate, //product expiration date in ISO format (YYYY-MM-DD)
      confidence, // Confidence score from image recognition (if available)
      createdAt: now.toISOString(), // Track creation time for potential future features like edit history
      isDeleted: false, // Soft delete flag for potential future features like item recovery or edit history
      lastUpdate: now.toISOString(), // Track last update time for potential future features like edit history
      notificationStatus: "PENDING", // Track notification status for upcoming expiration notifications (PENDING, SENT)
      TTL: ttl //ttl for automatic deletion after 30 days past expiration
    };

    // Save the new item to DynamoDB
    const saved = await createItem(item);

    res.json({
      success: true,
      data: saved
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
});

/**
 * GET /
 * Fetch all items for the authenticated user
*/

router.get(
  "/",
  async (req, res) => {
    try {
      const userId = getUserId(req); // Use "test-user" if authentication is not set up yet

      const lastKey = req.query.lastKey // For pagination, frontend can send last evaluated key as query parameter 
      ? JSON.parse(decodeURIComponent(req.query.lastKey)) || undefined // If lastKey  is provided, parse it from JSON string; otherwise, set to undefined for the service function to handle as first page request
      : undefined;

      // Call the service function to get items for the user from DynamoDB, with optional pagination
      const result = await getItemsByUser(userId, lastKey);
    
      return res.json({
        success: true, // Indicate successful response
        data: result.items, // Return the list of items for the user
        lastKey: result.lastKey || null // Return last evaluated key for pagination if available
      });
    } 
    // Error handling
    catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Failed to fetch items"
      });
    }
  }
);

/**
 * Get /sync last sync time for the user
 * This endpoint can be used by the frontend to determine if it needs to refresh its local cache of items.
 * The backend can return the timestamp of the last update to any item for the user, so the frontend can compare it with its last sync time.
 * If the backend's last update time is newer than the frontend's last sync time, the frontend can trigger a refresh of the items list.
 */
router.get(
  "/sync",
  async (req, res) => {
    try {
      const userId = getUserId(req); // Use "test-user" if authentication is not set up yet
      const { lastSync} = req.query; // Frontend can send its last sync time as a query parameter

    if (!lastSync) {
      return res.status(400).json({
         error: "Missing lastSync query parameter" 
      });
    }
    // Validate that lastSync is a valid date string
    const syncDate = new Date(lastSync);
     //Error handling for invalid timestamp
    if (isNaN(syncDate.getTime())) {
      return res.status(400).json({
        error: "Invalid lastSync timestamp" 
      });
    }
    
    const items = await getUpdatedItems(userId, lastSync);

    return res.json({
      success: true,
      data: items,
      serverTime: new Date().toISOString() // Return current server time for frontend to update its last sync time  
    });
    } catch (err) {
      console.error("Sync items error", err);
      return res.status(500).json({
        error: "Failed to fetch sync data"
      });
    }
});


/**
 * PUT /:itemId
 * Update an existing item for the user (e.g. to edit product name, brand, expiration date.)
 */
router.put(
  "/:itemId",
  async (req, res) => {
    try {
      const userId = getUserId(req);
      const { itemId } = req.params;

      // Extract fields to update from request body
      const {
        productName,
        brand,
        expirationDate
      } = req.body;

      //Basic validation for required fields and formats
      if (!productName || !expirationDate) {
        return res.status(400).json({
           error: "productName and expirationDate are required" 
          });
      }

      if (
        typeof productName !== "string" ||
        typeof expirationDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)
      ) {
        return res.status(400).json({
          error: "expirationDate must be in YYYY-MM-DD format and productName must be a string"
        });
      }

      const expDate = new Date(expirationDate);

      //Error handling for invalid date format
      if (isNaN(expDate.getTime())) {
        return res.status(400).json({
          error: "Invalid expiration date format"
        });
      }

      // Call the service function to update the item in DynamoDB
      const updated = await updateItem(userId, itemId, {
        productName,
        brand,
        expirationDate
      });

      return res.json({
        success: true, // Indicate successful update
        data: updated // Return the updated item data
      });
    } catch (err) { // Error handling
      console.error("Update item error", err);
      return res.status(500).json({
        error: "Failed to update item"
      });
    }
  }
);

/**
 * Delete /:itemId
 * soft delete an item
*/

router.delete(
  "/:itemId",
  async (req, res) => {
    try {
      //Extract user ID from authentication token
      const userId = getUserId(req);
      const { itemId } = req.params;
    
      // Call the service function to mark the item as deleted in DynamoDB
      await deleteItem(userId, itemId);

      return res.json({
        success: true, // Indicate successful deletion
      });
    } catch (err) { // Error handling
      console.error("Delete item error", err);
      return res.status(500).json({
        error: "Failed to delete item"
      });
    } 
  }
);
export default router;