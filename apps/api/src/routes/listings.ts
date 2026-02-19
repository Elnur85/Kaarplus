import { Router } from "express";

import * as listingController from "../controllers/listingController";
import { requireAuth, requireRole, optionalAuth } from "../middleware/auth";
import { requireListingOwnership } from "../middleware/ownership";
import { readLimiter, writeLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import {
	addImagesSchema,
	contactSellerSchema,
	createListingSchema,
	listingQuerySchema,
	reorderImagesSchema,
	updateListingSchema,
} from "../schemas/listing";
import { asyncHandler } from "../utils/asyncHandler";

export const listingsRouter = Router();

// Public routes - specific routes must come before parameterized routes
listingsRouter.get(
	"/",
	readLimiter,
	validate(listingQuerySchema, "query"),
	asyncHandler(listingController.getAllListings)
);
listingsRouter.get(
	"/metadata/filter-options",
	readLimiter,
	asyncHandler(listingController.getFilterOptions)
);
listingsRouter.get(
	"/metadata/featured",
	readLimiter,
	asyncHandler(listingController.getFeaturedListings)
);
listingsRouter.get(
	"/metadata/body-types",
	readLimiter,
	asyncHandler(listingController.getBodyTypeCounts)
);

// Parameterized routes come last
listingsRouter.get(
	"/:id",
	readLimiter,
	asyncHandler(listingController.getListingById)
);
listingsRouter.get(
	"/:id/similar",
	readLimiter,
	asyncHandler(listingController.getSimilarListings)
);
listingsRouter.post(
	"/:id/contact",
	optionalAuth,
	writeLimiter,
	validate(contactSellerSchema),
	asyncHandler(listingController.contactSeller)
);

// Protected routes (Seller/Dealership/Admin)
listingsRouter.post(
	"/",
	requireAuth,
	requireRole("USER", "DEALERSHIP", "ADMIN"),
	writeLimiter,
	validate(createListingSchema),
	asyncHandler(listingController.createListing)
);

// Protected routes (Owner/Admin)
listingsRouter.patch(
	"/:id",
	requireAuth,
	requireListingOwnership,
	writeLimiter,
	validate(updateListingSchema),
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
	validate(addImagesSchema),
	asyncHandler(listingController.addImages)
);
listingsRouter.patch(
	"/:id/images/reorder",
	requireAuth,
	requireListingOwnership,
	writeLimiter,
	validate(reorderImagesSchema),
	asyncHandler(listingController.reorderImages)
);
listingsRouter.delete(
	"/:id/images/:imageId",
	requireAuth,
	requireListingOwnership,
	writeLimiter,
	asyncHandler(listingController.deleteImage)
);
