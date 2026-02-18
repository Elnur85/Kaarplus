import { Router } from "express";

import * as adController from "../controllers/adController";
import * as adminController from "../controllers/adminController";
import { requireAuth, requireRole } from "../middleware/auth";
import { adminLimiter, readLimiter, writeLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

export const adminRouter = Router();

// All admin routes require admin role
adminRouter.use(requireAuth);
adminRouter.use(requireRole("ADMIN", "SUPPORT"));

// Apply base admin rate limiting
adminRouter.use(adminLimiter);

// Listings
adminRouter.get("/listings/pending", readLimiter, asyncHandler(adminController.getPendingListings));
adminRouter.patch("/listings/:id/verify", writeLimiter, asyncHandler(adminController.verifyListing));

// Users
adminRouter.get("/users", readLimiter, asyncHandler(adminController.getUsers));

// Analytics & Stats
adminRouter.get("/analytics", readLimiter, asyncHandler(adminController.getAnalytics));
adminRouter.get("/stats", readLimiter, asyncHandler(adminController.getStats));

// Ad Campaigns
adminRouter.get("/campaigns", readLimiter, asyncHandler(adController.getCampaigns));
adminRouter.post("/campaigns", writeLimiter, asyncHandler(adController.createCampaign));
adminRouter.get("/campaigns/:id", readLimiter, asyncHandler(adController.getCampaignById));
adminRouter.patch("/campaigns/:id", writeLimiter, asyncHandler(adController.updateCampaign));
adminRouter.delete("/campaigns/:id", writeLimiter, asyncHandler(adController.archiveCampaign));
adminRouter.get("/campaigns/:id/analytics", readLimiter, asyncHandler(adController.getCampaignAnalytics));

// Advertisements
adminRouter.post("/advertisements", writeLimiter, asyncHandler(adController.createAdvertisement));
adminRouter.patch("/advertisements/:id", writeLimiter, asyncHandler(adController.updateAdvertisement));

// Ad Units & Overview
adminRouter.get("/ad-units", readLimiter, asyncHandler(adController.getAdUnits));
adminRouter.get("/ad-analytics/overview", readLimiter, asyncHandler(adController.getAnalyticsOverview));

