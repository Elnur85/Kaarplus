import { prisma } from '@kaarplus/database';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';

describe('Listing Routes', () => {
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

    describe('GET /api/listings', () => {
        it('should return a list of active listings', async () => {
            const mockListings = [
                { id: '1', make: 'BMW', model: '320i', price: 15000, status: 'ACTIVE' },
                { id: '2', make: 'Audi', model: 'A4', price: 18000, status: 'ACTIVE' },
            ];

            (prisma.listing.findMany as any).mockResolvedValue(mockListings);
            (prisma.listing.count as any).mockResolvedValue(2);

            const response = await request(app).get('/api/listings');

            if (response.status !== 200) {
                console.error('GET /api/listings failed:', response.body);
            }

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.meta).toBeDefined();
        });

        it('should filter listings by make', async () => {
            const mockListings = [
                { id: '1', make: 'BMW', model: '320i', price: 15000, status: 'ACTIVE' },
            ];

            (prisma.listing.findMany as any).mockResolvedValue(mockListings);
            (prisma.listing.count as any).mockResolvedValue(1);

            const response = await request(app).get('/api/listings?make=BMW');

            expect(response.status).toBe(200);
            expect(prisma.listing.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        make: expect.objectContaining({ equals: 'BMW' }),
                    }),
                })
            );
        });
    });

    describe('POST /api/listings', () => {
        it('should return 401 if not authenticated', async () => {
            const response = await request(app)
                .post('/api/listings')
                .send({ make: 'BMW' });

            expect(response.status).toBe(401);
        });

        it('should create a listing if authenticated as seller', async () => {
            const token = createAuthToken('user-123', 'INDIVIDUAL_SELLER');
            const listingData = {
                make: 'Tesla',
                model: 'Model 3',
                year: 2022,
                price: 35000,
                mileage: 15000,
                bodyType: 'sedan',
                fuelType: 'electric',
                transmission: 'automatic',
                powerKw: 200,
                colorExterior: 'White',
                condition: 'used',
                location: 'Tallinn',
                features: {}, // Corrected from []
            };

            (prisma.user.findUnique as any).mockResolvedValue({ id: 'user-123', role: 'INDIVIDUAL_SELLER' });
            (prisma.listing.count as any).mockResolvedValue(0); // for active listings check
            (prisma.listing.create as any).mockResolvedValue({
                id: 'new-id',
                userId: 'user-123',
                ...listingData,
                status: 'PENDING',
            });

            const response = await request(app)
                .post('/api/listings')
                .set('Cookie', [`token=${token}`])
                .send(listingData);

            if (response.status !== 201) {
                console.error('POST /api/listings failed:', response.body);
            }

            expect(response.status).toBe(201);
            expect(response.body.data.make).toBe('Tesla');
        });
    });
});
