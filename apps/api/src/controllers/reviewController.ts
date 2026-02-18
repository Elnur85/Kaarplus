import { Request, Response, NextFunction } from "express";

import { reviewService } from "../services/reviewService";
import { BadRequestError } from "../utils/errors";

/**
 * GET /api/reviews?targetId=X&page=1&pageSize=10
 * Get reviews for a specific seller (public).
 */
export async function getSellerReviews(req: Request, res: Response, next: NextFunction) {
    try {
        const { targetId, page, pageSize } = req.query;
        if (!targetId || typeof targetId !== "string") {
            throw new BadRequestError("targetId query parameter is required");
        }

        const result = await reviewService.getReviewsForUser(
            targetId,
            Number(page) || 1,
            Number(pageSize) || 10,
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/reviews/stats?targetId=X
 * Get review statistics for a seller (public).
 */
export async function getSellerReviewStats(req: Request, res: Response, next: NextFunction) {
    try {
        const { targetId } = req.query;
        if (!targetId || typeof targetId !== "string") {
            throw new BadRequestError("targetId query parameter is required");
        }

        const result = await reviewService.getReviewStats(targetId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/reviews
 * Create a new review (authenticated).
 */
export async function createReview(req: Request, res: Response, next: NextFunction) {
    try {
        const reviewerId = req.user!.id;
        const { targetId, listingId, rating, title, body } = req.body;

        if (!targetId || !body || rating === undefined) {
            throw new BadRequestError("targetId, rating, and body are required");
        }

        const review = await reviewService.createReview(reviewerId, {
            targetId,
            listingId,
            rating: Number(rating),
            title,
            body,
        });

        res.status(201).json({ data: review });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/reviews/:id
 * Delete own review (authenticated).
 */
export async function deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
        const reviewerId = req.user!.id;
        const result = await reviewService.deleteReview(req.params.id as string, reviewerId);
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/reviews/featured
 * Get featured reviews for home page (highest rated, most recent).
 */
export async function getFeaturedReviews(req: Request, res: Response, next: NextFunction) {
    try {
        const limit = Math.min(Number(req.query.limit) || 6, 20);
        const result = await reviewService.getFeaturedReviews(limit);
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
}
