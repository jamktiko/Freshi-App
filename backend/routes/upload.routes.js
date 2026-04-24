// Import Express framework for routing
import express from "express";

// Multer handles file uploads (stored in memory, not disk)
import multer from "multer";

// Middleware that verifies Cognito JWT token
import { authMiddleware } from "../middleware/auth.middleware.js";

// Service responsible for uploading images to AWS S3
import { uploadToS3 } from "../services/s3.service.js";

// AI service that extracts product information from OCR text
import { analyzeText } from "../services/ai-extraction.service.js";

// Create Express router instance
const router = express.Router();

// Configure multer to temporarily store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Upload endpoint
 * Flow:
 * 1. Authenticate user
 * 2. Upload image to S3
 * 3. Send OCR text to AI for analysis
 * 4. Return AI suggestion (NOT saved yet)
 */
router.post(
  "/",
  authMiddleware,              // Ensure user is authenticated via Cognito JWT
  upload.single("image"),      // Accept single file from form-data field "image"
  async (req, res) => {

    try {
      const userId = req.user.sub; // Extract user ID from decoded JWT token

      // Generate unique S3 key for storing uploaded image
      const imageKey = `uploads/${userId}/${Date.now()}.jpg`;

      // Upload image buffer to S3 bucket
      await uploadToS3(
        req.file.buffer,          // binary image data
        imageKey,                 // file path in S3
        req.file.mimetype         // content type (e.g. image/jpeg)
      );

      // Send OCR text to AI model for analysis (no DB write happens here)
      const aiSuggestion = await analyzeText(req.body.ocrText);

      // Return both image reference and AI suggestion to frontend
      res.json({
        success: true,
        data: {
          imageKey,              // stored image reference in S3
          suggestion: aiSuggestion // AI-generated structured product info
        }
      });

    } catch (err) {
      // Log full error for backend debugging
      console.error(err);

      // Return generic error to client (avoid leaking internal details)
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// Export router so it can be mounted in main app
export default router;