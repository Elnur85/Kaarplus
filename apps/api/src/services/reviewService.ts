import { prisma } from "@kaarplus/database";

import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors";

import { emailService } from "./emailService";

interface CreateReviewInput {
    targetId: string;
    listingId?: string;
    rating: number;
    title?: string;
    body: string;
}

export class ReviewService {
    async getReviewsForUser(targetId: string, page: number = 1, pageSize: number = 10) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { targetId },
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.review.count({ where: { targetId } }),
        ]);

        return {
            data: reviews,
            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async getReviewStats(targetId: string) {
        const reviews = await prisma.review.findMany({
            where: { targetId },
            select: { rating: true },
        });

        const total = reviews.length;
        if (total === 0) {
            return {
                data: {
                    averageRating: 0,
                    totalCount: 0,
                    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                },
            };
        }

        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        for (const review of reviews) {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
            sum += review.rating;
        }

        return {
            data: {
                averageRating: Math.round((sum / total) * 10) / 10,
                totalCount: total,
                distribution,
            },
        };
    }

    async createReview(reviewerId: string, data: CreateReviewInput) {
        if (data.rating < 1 || data.rating > 5 || !Number.isInteger(data.rating)) {
            throw new BadRequestError("Rating must be an integer between 1 and 5");
        }

        if (reviewerId === data.targetId) {
            throw new BadRequestError("You cannot review yourself");
        }

        if (data.body.length > 5000) {
            throw new BadRequestError("Review body cannot exceed 5000 characters");
        }

        if (data.title && data.title.length > 200) {
            throw new BadRequestError("Review title cannot exceed 200 characters");
        }

        // Verify target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: data.targetId },
        });
        if (!targetUser) {
            throw new NotFoundError("Target user not found");
        }

        // Check for duplicate review
        if (data.listingId) {
            const existing = await prisma.review.findUnique({
                where: {
                    reviewerId_targetId_listingId: {
                        reviewerId,
                        targetId: data.targetId,
                        listingId: data.listingId,
                    },
                },
            });
            if (existing) {
                throw new BadRequestError("You have already reviewed this listing");
            }
        } else {
            // When no listingId, limit to one general review per reviewer-target pair
            const existingGeneral = await prisma.review.findFirst({
                where: {
                    reviewerId,
                    targetId: data.targetId,
                    listingId: null,
                },
            });
            if (existingGeneral) {
                throw new BadRequestError("You have already reviewed this seller");
            }
        }

        const review = await prisma.review.create({
            data: {
                reviewerId,
                targetId: data.targetId,
                listingId: data.listingId,
                rating: data.rating,
                title: data.title,
                body: data.body,
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        // Send email notification to the reviewed user (non-blocking)
        if (targetUser.email) {
            const reviewerName = review.reviewer?.name || "A user";
            emailService
                .sendReviewNotificationEmail(targetUser.email, reviewerName, data.rating)
                .catch(() => {});
        }

        return review;
    }

    async deleteReview(id: string, reviewerId: string, isAdmin: boolean = false) {
        const review = await prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        // Allow admins to delete any review, otherwise only the reviewer can delete
        if (!isAdmin && review.reviewerId !== reviewerId) {
            throw new ForbiddenError("You can only delete your own reviews");
        }

        await prisma.review.delete({ where: { id } });

        return { message: "Review deleted" };
    }

    /**
     * Get featured reviews for home page (highest rated, most recent).
     * Includes reviewer info and listing details.
     */
    async getFeaturedReviews(limit: number = 6) {
        const reviews = await prisma.review.findMany({
            where: {
                rating: { gte: 4 }, // Only 4+ star reviews
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                listing: {
                    select: {
                        id: true,
                        make: true,
                        model: true,
                    },
                },
            },
            orderBy: [
                { rating: "desc" },
                { createdAt: "desc" },
            ],
            take: limit,
        });

        return reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            title: review.title,
            body: review.body,
            createdAt: review.createdAt,
            reviewer: review.reviewer,
            car: review.listing 
                ? `${review.listing.make} ${review.listing.model}`
                : undefined,
        }));
    }
}

export const reviewService = new ReviewService();
