//app.js - Main entry point for the FoodApp backend
//Import express and cors modules, and route handlers for health, items, auth, and AI endpoints. Set up middleware for CORS and JSON parsing, define routes, and add a global error handler. Finally, start the server on the specified port.
import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import itemsRoutes from "./routes/items.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import userDevicesRoutes from "./routes/userDevices.routes.js";

const app = express();


//Cors: Enables requests for frontend
app.use(cors({
  origin: "*", //Enables requests from all origins (during the development phase)
}));

//Json parses
app.use(express.json());

// 🌐 ROUTES
app.use("/health", healthRoutes);
app.use("/items", itemsRoutes);
app.use("/upload", uploadRoutes);
app.use("/ai", aiRoutes);
app.use("/userdevices", userDevicesRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "FoodApp backend",
    endpoints: {
      health: "/health",
      items: "/items",
      upload: "/upload",
      ai: "/ai",
      userDevices: "/userdevices"
    }
  });
});

// ❌ ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// 🚀 START SERVER, Beanstalk gives the port automatically
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});