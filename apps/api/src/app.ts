import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import express from "express";

import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { helmetMiddleware } from "./middleware/helmet";
import { defaultLimiter } from "./middleware/rateLimiter";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

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

  return app;
}
