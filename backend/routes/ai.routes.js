import express from "express";

// 🤖 AI service (Bedrock abstraction layer)
import { analyzeText } from "../services/ai-extraction.service.js";

// 🔐 Cognito authentication middleware
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth); // Apply authentication middleware to all AI routes


function getUserId(req) {
  return req.user.sub; // requireAuth middleware will populate req.user with the decoded JWT token, which contains the user's sub (unique identifier)
}

/**
 * 🤖 AI TEST ENDPOINT
 * --------------------------------------------
 * Purpose:
 * - Used for testing Bedrock integration
 * - NOT part of main production flow
 * - Does NOT store anything in DynamoDB
 *
 * Flow:
 * 1. Authenticate user
 * 2. Validate input
 * 3. Call AI service (Bedrock)
 * 4. Return structured JSON
 */

//AuthMiddleware
router.post("/",  async (req, res) => {
  try {
    const userId = getUserId(req); // Extract user ID from authenticated token (populated by requireAuth middleware)

    if (!userId) {
      return res.status(401).json({
        success: false,
         error: "Unauthorized" 
      });
    }

    const { rawText } = req.body;

    // Validate input exists
    if (!rawText) {
      return res.status(400).json({
        success: false,
        error: "rawText is required"
      });
    }

    //  Basic input protection (cost + abuse prevention)
    if (rawText.length > 2000) {
      return res.status(400).json({
        success: false,
        error: "Input too large"
      });
    }

    // 🤖 Call AI service (Bedrock Nova 2 Lite)
    const result = await analyzeText(rawText);

    // 📤 Return AI response to frontend
    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    // ❌ Log error for debugging
    console.error("AI route error:", err);

    // ❌ Return safe error response
    res.status(500).json({
      success: false,
      error: "AI processing failed"
    });
  }
});

export default router;