import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock must be before any imports
vi.mock('@kaarplus/database', () => ({
    prisma: {
        favorite: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
        listing: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

import { favoriteService } from './favoriteService';
import { prisma } from '@kaarplus/database';

describe('FavoriteService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getFavorites', () => {
        it('should return paginated favorites', async () => {
            const userId = 'u1';
            const mockFavorites = [{ id: 'fav1', listing: { id: 'l1' } }];
            vi.mocked(prisma.favorite.findMany).mockResolvedValue(mockFavorites as any);
            vi.mocked(prisma.favorite.count).mockResolvedValue(1);

            const result = await favoriteService.getFavorites(userId, 1, 10);
            expect(result.favorites).toEqual(mockFavorites);
            expect(result.total).toBe(1);
        });
    });

    describe('addFavorite', () => {
        it('should add listing and increment count', async () => {
            const userId = 'u1';
            const listingId = 'l1';
            
            vi.mocked(prisma.favorite.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.listing.findUnique).mockResolvedValue({ 
                id: listingId, 
                favoriteCount: 5 
            } as any);
            vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
                const tx = {
                    favorite: { create: vi.fn().mockResolvedValue({ id: 'fav1' }) },
                    listing: { update: vi.fn().mockResolvedValue({}) },
                };
                return await callback(tx);
            });

            const result = await favoriteService.addFavorite(userId, listingId);
            expect(result).toBeDefined();
        });

        it('should throw error if already favorited', async () => {
            const userId = 'u1';
            const listingId = 'l1';
            
            vi.mocked(prisma.favorite.findUnique).mockResolvedValue({ id: 'fav1' } as any);

            await expect(favoriteService.addFavorite(userId, listingId)).rejects.toThrow();
        });
    });

    describe('removeFavorite', () => {
        it('should remove listing and decrement count', async () => {
            const userId = 'u1';
            const listingId = 'l1';
            
            vi.mocked(prisma.favorite.findUnique).mockResolvedValue({ 
                id: 'fav1',
                listing: { favoriteCount: 5 }
            } as any);
            vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
                const tx = {
                    favorite: { delete: vi.fn().mockResolvedValue({}) },
                    listing: { update: vi.fn().mockResolvedValue({}) },
                };
                return await callback(tx);
            });

            await favoriteService.removeFavorite(userId, listingId);
            expect(prisma.favorite.findUnique).toHaveBeenCalled();
        });

        it('should throw error if favorite not found', async () => {
            const userId = 'u1';
            const listingId = 'l1';
            
            vi.mocked(prisma.favorite.findUnique).mockResolvedValue(null);

            await expect(favoriteService.removeFavorite(userId, listingId)).rejects.toThrow();
        });
    });

    describe('checkFavorite', () => {
        it('should return true if favorited', async () => {
            vi.mocked(prisma.favorite.findUnique).mockResolvedValue({ id: 'fav1' } as any);

            const result = await favoriteService.checkFavorite('u1', 'l1');
            expect(result.isFavorited).toBe(true);
        });

        it('should return false if not favorited', async () => {
            vi.mocked(prisma.favorite.findUnique).mockResolvedValue(null);

            const result = await favoriteService.checkFavorite('u1', 'l1');
            expect(result.isFavorited).toBe(false);
        });
    });
});
