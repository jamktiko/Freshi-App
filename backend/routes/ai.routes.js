// routes/ai.routes.js

import express from "express";

// Middleware that verifies Cognito JWT token
import { requireAuth } from "../middleware/auth.middleware.js";

// AI service responsible for OCR text analysis
import { analyzeText } from "../services/ai-extraction.service.js";

const router = express.Router();

// Protect all AI routes
router.use(requireAuth);

/**
 * POST /ai/analyze
 *
 * Receives OCR text from frontend
 * Sends OCR text to AI model
 * Returns structured product suggestion
 */
router.post("/analyze", async (req, res) => {

  try {

    const { ocrText } = req.body;

    // Validate OCR text
    if (
      !ocrText ||
      typeof ocrText !== "string" ||
      ocrText.trim().length === 0
    ) {
      return res.status(400).json({
        error: "ocrText is required"
      });
    }

    // Send OCR text to AI service
    const suggestion = await analyzeText(
      ocrText.trim()
    );

    // Return AI response
    return res.json({
      success: true,
      data: {
        suggestion
      }
    });

  } catch (err) {

    console.error("AI analysis error:", err);

    return res.status(500).json({
      error: "AI analysis failed",
      details: err.message
    });
  }
});