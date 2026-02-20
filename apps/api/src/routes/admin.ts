import { Router } from "express";

import * as adController from "../controllers/adController";
import * as adminController from "../controllers/adminController";
import * as inspectionController from "../controllers/inspectionController";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  adminLimiter,
  readLimiter,
  writeLimiter,
} from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
  createAdSchema,
  updateAdSchema,
  createCampaignSchema,
  updateCampaignSchema,
  adQuerySchema,
  analyticsQuerySchema,
} from "../schemas/ad";
import { adminQuerySchema, verifyListingSchema, updateInspectionSchema } from "../schemas/admin";
import { asyncHandler } from "../utils/asyncHandler";

export const adminRouter = Router();

// All admin routes require admin role
adminRouter.use(requireAuth);
adminRouter.use(requireRole("ADMIN", "SUPPORT"));

// Apply base admin rate limiting
adminRouter.use(adminLimiter);

// Listings
adminRouter.get(
  "/listings/pending",
  readLimiter,
  validate(adminQuerySchema, "query"),
  asyncHandler(adminController.getPendingListings)
);
adminRouter.patch(
  "/listings/:id/verify",
  writeLimiter,
  validate(verifyListingSchema),
  asyncHandler(adminController.verifyListing)
);

// Inspections
adminRouter.get(
  "/inspections",
  readLimiter,
  asyncHandler(inspectionController.getAllInspections)
);
adminRouter.patch(
  "/inspections/:id",
  writeLimiter,
  validate(updateInspectionSchema),
  asyncHandler(inspectionController.updateInspectionStatus)
);

// Users
adminRouter.get(
  "/users",
  readLimiter,
  validate(adminQuerySchema, "query"),
  asyncHandler(adminController.getUsers)
);

// Analytics & Stats
adminRouter.get(
  "/analytics",
  readLimiter,
  asyncHandler(adminController.getAnalytics)
);
adminRouter.get("/stats", readLimiter, asyncHandler(adminController.getStats));

// Ad Campaigns
adminRouter.get(
  "/campaigns",
  readLimiter,
  validate(adQuerySchema, "query"),
  asyncHandler(adController.getCampaigns)
);
adminRouter.post(
  "/campaigns",
  writeLimiter,
  validate(createCampaignSchema),
  asyncHandler(adController.createCampaign)
);
adminRouter.get(
  "/campaigns/:id",
  readLimiter,
  asyncHandler(adController.getCampaignById)
);
adminRouter.patch(
  "/campaigns/:id",
  writeLimiter,
  validate(updateCampaignSchema),
  asyncHandler(adController.updateCampaign)
);
adminRouter.delete(
  "/campaigns/:id",
  writeLimiter,
  asyncHandler(adController.archiveCampaign)
);
adminRouter.get(
  "/campaigns/:id/analytics",
  readLimiter,
  validate(analyticsQuerySchema, "query"),
  asyncHandler(adController.getCampaignAnalytics)
);

// Advertisements
adminRouter.post(
  "/advertisements",
  writeLimiter,
  validate(createAdSchema),
  asyncHandler(adController.createAdvertisement)
);
adminRouter.patch(
  "/advertisements/:id",
  writeLimiter,
  validate(updateAdSchema),
  asyncHandler(adController.updateAdvertisement)
);

// Ad Units & Overview
adminRouter.get("/ad-units", readLimiter, asyncHandler(adController.getAdUnits));
adminRouter.get(
  "/ad-analytics/overview",
  readLimiter,
  asyncHandler(adController.getAnalyticsOverview)
);
