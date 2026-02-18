import { Router } from "express";

import * as adController from "../controllers/adController";
import { readLimiter, writeLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

export const contentBlocksRouter = Router();

// Public: Get sponsored listings for search results (must be before /:placementId)
contentBlocksRouter.get(
  "/sponsored/listings",
  readLimiter,
  asyncHandler(adController.getSponsoredListings)
);

// Public: Fetch active ad for a placement
contentBlocksRouter.get(
  "/:placementId",
  readLimiter,
  asyncHandler(adController.getAdForPlacement)
);

// Public: Track impression/click events
contentBlocksRouter.post(
  "/:id/engage",
  writeLimiter,
  asyncHandler(adController.trackAdEvent)
);
