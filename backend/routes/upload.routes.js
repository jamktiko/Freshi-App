// Import Express framework for routing
import express from "express";

// Multer handles file uploads (stored in memory, not disk)
import multer from "multer";

// Middleware that verifies Cognito JWT token
import { requireAuth } from "../middleware/auth.middleware.js";

// Service responsible for uploading images to AWS S3
import { uploadToS3, getSignedImageUrl } from "../services/s3.service.js";


// Create Express router instance
const router = express.Router();

router.use(requireAuth); // Apply authentication middleware to all upload routes

// Configure multer to temporarily store uploaded files in memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

/**
 * Upload endpoint
 * Flow:
 * 1. Authenticate user
 * 2. Upload image to S3
 */
router.post(
  "/",
  upload.single("image"),      // Accept single file from form-data field "image"
  async (req, res) => {

    // Validate that a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    try {
      const userId = req.user.sub; // Extract user ID from authenticated token (populated by requireAuth middleware)


      // Validate file type (only allow JPEG and PNG)
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Unsupported file type. Only JPEG and PNG are allowed." });
      }

      // Generate unique S3 key for storing uploaded image
      const extension = req.file.mimetype.split("/")[1]; // Get file extension from MIME type (e.g. "jpeg" from "image/jpeg")
      const s3imageKey = `uploads/${userId}/${Date.now()}.${extension}`;


      // Upload image buffer to S3 bucket
      await uploadToS3(
        req.file.buffer,          // binary image data
        s3imageKey,                 // file path in S3
        req.file.mimetype         // content type (e.g. image/jpeg)
      );

      
      // Return image reference to frontend
      res.json({
        success: true,
        data: {
          s3imageKey              // stored image reference in S3
        }
      });

    } catch (err) {
      // Log full error for backend debugging
      console.error(err);

      // Return generic error to client (avoid leaking internal details)
      res.status(500).json({ error: "Upload failed",
      details: err.message
       });
    }
  }
);

    /**
 * Generate signed image URL
 * Flow:
 * 1. Authenticate user
 * 2. Receive S3imageKey from frontend
 * 3. Verify that image belongs to authenticated user
 * 4. Return temporary signed URL
 */
router.post("/image-url", async (req, res) => {
  try {
    const userId = req.user.sub;
    const { S3imageKey } = req.body;

    if (!S3imageKey || typeof S3imageKey !== "string") {
      return res.status(400).json({
        error: "S3imageKey is required"
      });
    }

    const cleanKey = S3imageKey.trim();

    // Ownership check
    if (!cleanKey.startsWith(`uploads/${userId}/`)) {
      return res.status(403).json({
        error: "Forbidden"
      });
    }

    const imageUrl = await getSignedImageUrl(cleanKey);

    return res.json({
      success: true,
      data: {
        S3imageKey: cleanKey,
        imageUrl
      }
    });

  } catch (err) {
    console.error("Generate signed image URL error:", err);

    return res.status(500).json({
      error: "Failed to generate image URL"
    });
  }
});

// Export router so it can be mounted in main app
export default router;