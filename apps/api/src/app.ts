import { createServer } from "http";

import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import express from "express";

import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { helmetMiddleware } from "./middleware/helmet";
import { defaultLimiter } from "./middleware/rateLimiter";
import { socketAuthMiddleware } from "./middleware/socketAuth";
import { apiRouter } from "./routes";
import { socketService } from "./services/socketService";
import { handleSocketConnection } from "./socket/connectionHandler";
import { logger } from "./utils/logger";

/**
 * Create and configure the Express application and HTTP server.
 * Also initializes Socket.io for real-time messaging.
 */
export function createApp() {
  const app = express();
  const httpServer = createServer(app);

  // --- Global middleware ---
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(defaultLimiter);
  app.use(cookieParser());

  // JSON body parser with raw body capturing for webhooks
  app.use(
    express.json({
      limit: "10mb",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));

  // --- Routes ---
  app.use("/api", apiRouter);

  // --- Error handling (must be last) ---
  // Sentry error handler must be before any other error middleware
  Sentry.setupExpressErrorHandler(app);

  app.use(errorHandler);

  // --- Socket.io initialization ---
  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
  
  try {
    // Initialize socket service
    socketService.initialize(httpServer, corsOrigin);
    
    // Get io instance and set up authentication middleware
    const io = socketService.getIO();
    io.use(socketAuthMiddleware);
    
    // Handle connections
    io.on("connection", handleSocketConnection);
    
    logger.info("[App] Socket.io initialized successfully");
  } catch (error) {
    logger.error("[App] Failed to initialize Socket.io:", error);
    // Don't throw - the REST API should still work even if Socket.io fails
  }

  return { app, httpServer };
}
