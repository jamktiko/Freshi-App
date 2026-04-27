import express from "express";
//import { authMiddleware } from "../middleware/auth.middleware.js";
import { createItem } from "../services/dynamo.service.js";

const router = express.Router();

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
  //Authmiddleware, // Uncomment this line to enable authentication for item routes
  async (req, res) => {
  try {
    //Extract user ID from authentucation token
    const userId = req.user?.sub || "test-user"; // Use "test-user" if authentication is not set up yet

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
      return res.status(400).json({ error: "Missing required fields" });
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

export default router;