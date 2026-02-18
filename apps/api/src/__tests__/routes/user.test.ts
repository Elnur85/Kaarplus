import { prisma } from '@kaarplus/database';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';

describe('User Routes', () => {
    let app: any;
    const JWT_SECRET = 'test-secret';

    beforeAll(async () => {
        process.env.JWT_SECRET = JWT_SECRET;
        process.env.NODE_ENV = 'test';
        const { createApp } = await import('../../app');
        const instances = createApp();
        app = instances.app;
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createAuthToken = (userId: string, role = 'USER') => {
        return jwt.sign({ id: userId, email: 'test@example.com', role }, JWT_SECRET);
    };

    describe('Favorites', () => {
        it('should return user favorites', async () => {
            const userId = 'user-123';
            const token = createAuthToken(userId);
            const mockFavorites = [
                { id: 'fav-1', userId, listingId: 'listing-1', listing: { id: 'listing-1', make: 'BMW' } },
            ];

            (prisma.favorite.findMany as any).mockResolvedValue(mockFavorites);
            (prisma.favorite.findMany as any).mockResolvedValue(mockFavorites);
            (prisma.favorite.count as any).mockResolvedValue(1);

            const response = await request(app)
                .get('/api/user/favorites')
                .set('Cookie', [`token=${token}`]);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);
        });

        it('should add a favorite', async () => {
            const userId = 'user-123';
            const listingId = 'listing-1';
            const token = createAuthToken(userId);

            (prisma.listing.findUnique as any).mockResolvedValue({ id: listingId });
            (prisma.favorite.findUnique as any).mockResolvedValue(null);
            (prisma.favorite.create as any).mockResolvedValue({ id: 'new-fav', userId, listingId });

            const response = await request(app)
                .post(`/api/user/favorites/${listingId}`)
                .set('Cookie', [`token=${token}`]);

            if (response.status !== 201) {
                console.error('POST /api/user/favorites failed:', response.body);
            }

            expect(response.status).toBe(201);
            expect(prisma.favorite.create).toHaveBeenCalled();
        });

        it('should remove a favorite', async () => {
            const userId = 'user-123';
            const listingId = 'listing-1';
            const token = createAuthToken(userId);

            (prisma.favorite.findUnique as any).mockResolvedValue({ id: 'existing-fav', userId, listingId });
            (prisma.favorite.delete as any).mockResolvedValue({ id: 'deleted-fav' });

            const response = await request(app)
                .delete(`/api/user/favorites/${listingId}`)
                .set('Cookie', [`token=${token}`]);

            if (response.status !== 200) {
                console.error('DELETE /api/user/favorites failed:', response.body);
            }

            expect(response.status).toBe(200);
            expect(prisma.favorite.delete).toHaveBeenCalled();
        });
    });

    describe('Messages', () => {
        it('should return conversations', async () => {
            const token = createAuthToken('user-123');
            (prisma.$queryRaw as any).mockResolvedValue([]);

            const response = await request(app)
                .get('/api/user/messages')
                .set('Cookie', [`token=${token}`]);

            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
        });
    });
});
