import { Router } from "express";

import * as listingController from "../controllers/listingController";
import { requireAuth, requireRole } from "../middleware/auth";
import { readLimiter, writeLimiter } from "../middleware/rateLimiter";

export const listingsRouter = Router();

// Public routes
listingsRouter.get("/", readLimiter, listingController.getAllListings);
listingsRouter.get("/:id", listingController.getListingById);
listingsRouter.get("/:id/similar", listingController.getSimilarListings);
listingsRouter.post("/:id/contact", listingController.contactSeller);

// Protected routes (Seller/Dealership/Admin)
listingsRouter.post(
    "/",
    requireAuth,
    requireRole("INDIVIDUAL_SELLER", "DEALERSHIP", "ADMIN"),
    writeLimiter,
    listingController.createListing
);

// Protected routes (Owner/Admin)
listingsRouter.patch("/:id", requireAuth, listingController.updateListing);
listingsRouter.delete("/:id", requireAuth, listingController.deleteListing);
