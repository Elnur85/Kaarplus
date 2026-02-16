import { Router, Request, Response } from "express";

import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { dealershipRouter } from "./dealerships";
import { debugSentryRouter } from "./debug-sentry";
import { listingsRouter } from "./listings";
import { paymentsRouter } from "./payments";
import { searchRouter } from "./search";
import { uploadsRouter } from "./uploads";
import { userRouter } from "./user";
import { webhooksRouter } from "./webhooks";

export const apiRouter = Router();

// Health check
apiRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Route mounting
apiRouter.use("/auth", authRouter);
apiRouter.use("/listings", listingsRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/webhooks", webhooksRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/dealerships", dealershipRouter);
apiRouter.use("/", debugSentryRouter);
