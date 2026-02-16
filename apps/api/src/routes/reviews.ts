import { Router } from "express";

import { getSellerReviews, getSellerReviewStats, createReview, deleteReview } from "../controllers/reviewController";
import { requireAuth } from "../middleware/auth";
import { readLimiter, writeLimiter } from "../middleware/rateLimiter";

export const reviewsRouter = Router();

// Public
reviewsRouter.get("/", readLimiter, getSellerReviews);
reviewsRouter.get("/stats", readLimiter, getSellerReviewStats);

// Authenticated
reviewsRouter.post("/", requireAuth, writeLimiter, createReview);
reviewsRouter.delete("/:id", requireAuth, writeLimiter, deleteReview);
