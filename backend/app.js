//app.js - Main entry point for the FoodApp backend
//Import express and cors modules, and route handlers for health, items, auth, and AI endpoints. Set up middleware for CORS and JSON parsing, define routes, and add a global error handler. Finally, start the server on the specified port.
import express from "express";
import { requireApiGatewaySecret } from "./middleware/auth.middleware.js";
//import cors from "cors"; //Cors is handled by API Gateway in production, but we might need it for local development and testing

import healthRoutes from "./routes/health.routes.js";
import itemsRoutes from "./routes/items.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import userDevicesRoutes from "./routes/userDevices.routes.js";

const app = express();


//Cors: Enables requests for frontend but is not needed in production since API Gateway will handle CORS. Uncomment during local development if testing with a frontend running on a different port.
//app.use(cors({
//  origin: "*", //Enables requests from all origins (during the development phase)
//}));

//Json parses
app.use(express.json());
//Allow to use /health and default endpoint without API Gateway secret for easier health checks and testing. All other routes will require the secret for added security.
app.use((req, res, next) => {
  if (req.path === "/health" || req.path === "/") {
    return next(); // skip secret check
  }
  // For all other routes, require the API Gateway secret to ensure only authorized requests are accepted
  return requireApiGatewaySecret(req, res, next);
});


//debugging Api gateway 
app.use((req, res, next) => {
  console.log("METHOD:", req.method);
  console.log("ORIGINAL URL:", req.originalUrl);
  console.log("PATH:", req.path);
  next();
});

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