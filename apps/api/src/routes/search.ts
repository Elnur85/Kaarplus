import { Router } from "express";

import * as listingController from "../controllers/listingController";
import * as searchController from "../controllers/searchController";
import { readLimiter } from "../middleware/rateLimiter";

export const searchRouter = Router();

searchRouter.use(readLimiter);

// Search and Discovery
searchRouter.get("/", listingController.getAllListings); // Map /api/search to listings filter
searchRouter.get("/makes", searchController.getMakes);
searchRouter.get("/models", searchController.getModels);
searchRouter.get("/filters", searchController.getFilterOptions);
searchRouter.get("/locations", searchController.getLocations);
searchRouter.get("/colors", searchController.getColors);
searchRouter.get("/drive-types", searchController.getDriveTypes);
searchRouter.get("/stats", searchController.getPlatformStats);
