import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

// Mock must be before importing the service
vi.mock('@kaarplus/database', () => ({
    prisma: {
        review: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        }
    },
}));

vi.mock('./emailService', () => ({
    emailService: {
        sendReviewNotificationEmail: vi.fn().mockResolvedValue(true),
    }
}));

import { ReviewService } from './reviewService';
import { prisma } from '@kaarplus/database';
import { emailService } from './emailService';

describe('ReviewService', () => {
    let service: ReviewService;

    beforeEach(() => {
        service = new ReviewService();
        vi.clearAllMocks();
    });

    describe('getReviewsForUser', () => {
        it('should return paginated reviews', async () => {
            const mockReviews = [{ id: 'r1', rating: 5 }];
            vi.mocked(prisma.review.findMany).mockResolvedValue(mockReviews as any);
            vi.mocked(prisma.review.count).mockResolvedValue(1);

            const result = await service.getReviewsForUser('u1', 1, 10);
            expect(prisma.review.findMany).toHaveBeenCalled();
            expect(result.data).toEqual(mockReviews);
            expect(result.meta.total).toBe(1);
        });
    });

    describe('getReviewStats', () => {
        it('should calculate stats correctly', async () => {
            const mockReviews = [
                { rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 1 }
            ];
            vi.mocked(prisma.review.findMany).mockResolvedValue(mockReviews as any);

            const result = await service.getReviewStats('u1');
            expect(result.data.averageRating).toBe(3.8);
            expect(result.data.totalCount).toBe(4);
            expect(result.data.distribution[5]).toBe(2);
            expect(result.data.distribution[4]).toBe(1);
            expect(result.data.distribution[1]).toBe(1);
        });

        it('should return zero stats when no reviews', async () => {
            vi.mocked(prisma.review.findMany).mockResolvedValue([]);

            const result = await service.getReviewStats('u1');
            expect(result.data.averageRating).toBe(0);
            expect(result.data.totalCount).toBe(0);
            expect(result.data.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        });
    });

    describe('createReview', () => {
        it('should create review and send notification', async () => {
            const reviewData = {
                targetId: 'u2',
                listingId: 'l1',
                rating: 5,
                body: 'Great seller!',
            };
            
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ 
                id: 'u2', 
                name: 'Seller',
                email: 'seller@example.com'
            } as any);
            vi.mocked(prisma.review.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.review.create).mockResolvedValue({ 
                id: 'r1', 
                reviewerId: 'u1',
                ...reviewData,
                reviewer: { name: 'Reviewer' }
            } as any);

            const result = await service.createReview('u1', reviewData);
            expect(result).toBeDefined();
            expect(emailService.sendReviewNotificationEmail).toHaveBeenCalled();
        });

        it('should throw BadRequestError if rating is invalid', async () => {
            const reviewData = {
                targetId: 'u2',
                rating: 6,
                body: 'Test',
            };

            await expect(service.createReview('u1', reviewData)).rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError if self-review', async () => {
            const reviewData = {
                targetId: 'u1',
                rating: 5,
                body: 'Self review',
            };

            await expect(service.createReview('u1', reviewData)).rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError if already reviewed listing', async () => {
            const reviewData = {
                targetId: 'u2',
                listingId: 'l1',
                rating: 5,
                body: 'Great!',
            };
            
            vi.mocked(prisma.review.findUnique).mockResolvedValue({ id: 'r1' } as any);

            await expect(service.createReview('u1', reviewData)).rejects.toThrow(BadRequestError);
        });

        it('should throw NotFoundError if target user not found', async () => {
            const reviewData = {
                targetId: 'u2',
                rating: 5,
                body: 'Test',
            };
            
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            await expect(service.createReview('u1', reviewData)).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteReview', () => {
        it('should delete review if owner', async () => {
            const mockReview = { id: 'r1', reviewerId: 'u1' };
            vi.mocked(prisma.review.findUnique).mockResolvedValue(mockReview as any);
            vi.mocked(prisma.review.delete).mockResolvedValue(mockReview as any);

            const result = await service.deleteReview('r1', 'u1', false);
            expect(result.message).toBe('Review deleted');
            expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
        });

        it('should allow admin to delete any review', async () => {
            const mockReview = { id: 'r1', reviewerId: 'u2' };
            vi.mocked(prisma.review.findUnique).mockResolvedValue(mockReview as any);
            vi.mocked(prisma.review.delete).mockResolvedValue(mockReview as any);

            await service.deleteReview('r1', 'admin', true);
            expect(prisma.review.delete).toHaveBeenCalled();
        });

        it('should throw NotFoundError if review not found', async () => {
            vi.mocked(prisma.review.findUnique).mockResolvedValue(null);

            await expect(service.deleteReview('999', 'u1', false)).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError if not owner and not admin', async () => {
            const mockReview = { id: 'r1', reviewerId: 'u2' };
            vi.mocked(prisma.review.findUnique).mockResolvedValue(mockReview as any);

            await expect(service.deleteReview('r1', 'u3', false)).rejects.toThrow(ForbiddenError);
        });
    });
});
