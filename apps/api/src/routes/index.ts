import { Router, Request, Response } from "express";

import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { contentBlocksRouter } from "./content-blocks";
import { dealershipRouter } from "./dealerships";
import { listingsRouter } from "./listings";
import { mobileRouter } from "./mobile";
import { newsletterRouter } from "./newsletter";
import { paymentsRouter } from "./payments";
import { reviewsRouter } from "./reviews";
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
apiRouter.use("/mobile", mobileRouter);
apiRouter.use("/newsletter", newsletterRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/content-blocks", contentBlocksRouter);
// Debug routes only available in non-production environments
if (process.env.NODE_ENV !== "production") {
  import("./debug-sentry").then(({ debugSentryRouter }) => {
    apiRouter.use("/debug", debugSentryRouter);
  });
}
