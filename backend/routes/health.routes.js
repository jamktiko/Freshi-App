import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "OK",
      service: "FoodApp backend",
      timestamp: new Date().toISOString()
    }
  });
});

export default router;