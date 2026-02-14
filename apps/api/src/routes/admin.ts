import { Router } from "express";

import * as adminController from "../controllers/adminController";
import { requireAuth, requireRole } from "../middleware/auth";


export const adminRouter = Router();

// All admin routes require admin role
adminRouter.use(requireAuth);
adminRouter.use(requireRole("ADMIN", "SUPPORT"));

// Listings
adminRouter.get("/listings/pending", adminController.getPendingListings);
adminRouter.patch("/listings/:id/verify", adminController.verifyListing);

// Users
adminRouter.get("/users", adminController.getUsers);

