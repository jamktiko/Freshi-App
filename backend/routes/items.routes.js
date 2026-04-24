import express from "express";
//import { authMiddleware } from "../middleware/auth.middleware.js";
import { createItem } from "../services/dynamo.service.js";

const router = express.Router();

//authMiddleware, // Uncomment this line to enable authentication for item routes

router.post("/",  async (req, res) => {
  try {
    const userId = req.user.sub;

    const {
      imageKey,
      productName,
      brand,
      expirationDate,
      confidence
    } = req.body;

    const item = {
      PK: `USER#${userId}`,
      SK: `ITEM#${Date.now()}`,
      imageKey,
      productName,
      brand,
      expirationDate,
      confidence,
      createdAt: new Date().toISOString()
    };

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