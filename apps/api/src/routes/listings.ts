import { Router } from "express";

import * as listingController from "../controllers/listingController";
import { requireAuth, requireRole } from "../middleware/auth";
import { readLimiter, writeLimiter } from "../middleware/rateLimiter";

export const listingsRouter = Router();

// Public routes
listingsRouter.get("/", readLimiter, listingController.getAllListings);
listingsRouter.get("/:id", readLimiter, listingController.getListingById);
listingsRouter.get("/:id/similar", listingController.getSimilarListings);
listingsRouter.post("/:id/contact", writeLimiter, listingController.contactSeller);

// Protected routes (Seller/Dealership/Admin)
listingsRouter.post(
    "/",
    requireAuth,
    requireRole("INDIVIDUAL_SELLER", "DEALERSHIP", "ADMIN"),
    writeLimiter,
    listingController.createListing
);

// Protected routes (Owner/Admin)
listingsRouter.patch("/:id", requireAuth, writeLimiter, listingController.updateListing);
listingsRouter.delete("/:id", requireAuth, writeLimiter, listingController.deleteListing);

// Image management (Owner/Admin)
listingsRouter.post("/:id/images", requireAuth, writeLimiter, listingController.addImages);
listingsRouter.patch("/:id/images/reorder", requireAuth, writeLimiter, listingController.reorderImages);
listingsRouter.delete("/:id/images/:imageId", requireAuth, writeLimiter, listingController.deleteImage);

