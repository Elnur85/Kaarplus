import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock must be before importing the service
vi.mock('@kaarplus/database', () => ({
    prisma: {
        listing: {
            count: vi.fn(),
            aggregate: vi.fn(),
            findMany: vi.fn(),
        },
        message: {
            count: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        }
    },
}));

import { getUserDashboardStats, getUserListings, getUserProfile, updateUserProfile } from './dashboardService';
import { prisma } from '@kaarplus/database';

describe('DashboardService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUserDashboardStats', () => {
        it('should return aggregated stats', async () => {
            const userId = 'u1';
            vi.mocked(prisma.listing.count).mockResolvedValue(5);
            vi.mocked(prisma.listing.aggregate)
                .mockResolvedValueOnce({ _sum: { viewCount: 100 } } as any)
                .mockResolvedValueOnce({ _sum: { favoriteCount: 10 } } as any);
            vi.mocked(prisma.message.count).mockResolvedValue(2);

            const result = await getUserDashboardStats(userId);

            expect(result.activeListings).toBe(5);
            expect(result.totalViews).toBe(100);
            expect(result.totalFavorites).toBe(10);
            expect(result.totalMessages).toBe(2);
        });
    });

    describe('getUserListings', () => {
        it('should return user listings with pagination', async () => {
            const userId = 'u1';
            const mockListings = [{ id: 'l1', make: 'Toyota' }];
            vi.mocked(prisma.listing.findMany).mockResolvedValue(mockListings as any);
            vi.mocked(prisma.listing.count).mockResolvedValue(1);

            const result = await getUserListings(userId, 1, 10);
            expect(result.listings).toEqual(mockListings);
            expect(result.total).toBe(1);
            expect(prisma.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId },
                take: 10,
                skip: 0,
            }));
        });
    });

    describe('getUserProfile', () => {
        it('should return user profile', async () => {
            const userId = 'u1';
            const mockUser = { id: userId, name: 'Test User', email: 'test@example.com' };
            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

            const result = await getUserProfile(userId);
            expect(result).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: userId },
            }));
        });

        it('should return null if user not found', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            const result = await getUserProfile('999');
            expect(result).toBeNull();
        });
    });

    describe('updateUserProfile', () => {
        it('should update and return user profile', async () => {
            const userId = 'u1';
            const updateData = { name: 'Updated Name' };
            const mockUser = { id: userId, ...updateData };
            vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

            const result = await updateUserProfile(userId, updateData);
            expect(result).toEqual(mockUser);
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: userId },
                data: updateData,
            }));
        });
    });
});
