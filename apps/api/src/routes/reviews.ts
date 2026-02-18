import { Router } from "express";

import { getSellerReviews, getSellerReviewStats, createReview, deleteReview, getFeaturedReviews } from "../controllers/reviewController";
import { requireAuth } from "../middleware/auth";
import { readLimiter, writeLimiter } from "../middleware/rateLimiter";

export const reviewsRouter = Router();

// Public
reviewsRouter.get("/", readLimiter, getSellerReviews);
reviewsRouter.get("/stats", readLimiter, getSellerReviewStats);
reviewsRouter.get("/featured", readLimiter, getFeaturedReviews);

// Authenticated
reviewsRouter.post("/", requireAuth, writeLimiter, createReview);
reviewsRouter.delete("/:id", requireAuth, writeLimiter, deleteReview);
