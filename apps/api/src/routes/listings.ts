import { Router } from "express";

import * as listingController from "../controllers/listingController";
import { requireAuth, requireRole } from "../middleware/auth";
import { requireListingOwnership } from "../middleware/ownership";
import { readLimiter, writeLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

export const listingsRouter = Router();

// Public routes
listingsRouter.get("/", readLimiter, asyncHandler(listingController.getAllListings));
listingsRouter.get("/:id", readLimiter, asyncHandler(listingController.getListingById));
listingsRouter.get("/:id/similar", readLimiter, asyncHandler(listingController.getSimilarListings));
listingsRouter.post("/:id/contact", writeLimiter, asyncHandler(listingController.contactSeller));

// Protected routes (Seller/Dealership/Admin)
listingsRouter.post(
    "/",
    requireAuth,
    requireRole("INDIVIDUAL_SELLER", "DEALERSHIP", "ADMIN"),
    writeLimiter,
    asyncHandler(listingController.createListing)
);

// Protected routes (Owner/Admin)
listingsRouter.patch(
    "/:id",
    requireAuth,
    requireListingOwnership,
    writeLimiter,
    asyncHandler(listingController.updateListing)
);
listingsRouter.delete(
    "/:id",
    requireAuth,
    requireListingOwnership,
    writeLimiter,
    asyncHandler(listingController.deleteListing)
);

// Image management (Owner/Admin)
listingsRouter.post(
    "/:id/images",
    requireAuth,
    requireListingOwnership,
    writeLimiter,
    asyncHandler(listingController.addImages)
);
listingsRouter.patch(
    "/:id/images/reorder",
    requireAuth,
    requireListingOwnership,
    writeLimiter,
    asyncHandler(listingController.reorderImages)
);
listingsRouter.delete(
    "/:id/images/:imageId",
    requireAuth,
    requireListingOwnership,
    writeLimiter,
    asyncHandler(listingController.deleteImage)
);

