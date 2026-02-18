import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ForbiddenError, NotFoundError } from '../utils/errors';

// Mock must be before importing the service
vi.mock('@kaarplus/database', () => ({
    prisma: {
        listing: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
        image: {
            createMany: vi.fn(),
            deleteMany: vi.fn(),
        },
        $transaction: vi.fn(),
    },
    ListingStatus: {
        ACTIVE: 'ACTIVE',
        PENDING: 'PENDING',
        SOLD: 'SOLD',
    },
}));

import { ListingService } from './listingService';

import { prisma } from '@kaarplus/database';

describe('ListingService', () => {
    let service: ListingService;

    beforeEach(() => {
        service = new ListingService();
        vi.clearAllMocks();
    });

    describe('getAllListings', () => {
        it('should return paginated listings', async () => {
            const mockListings = [{ id: 'l1', make: 'BMW' }];
            vi.mocked(prisma.listing.findMany).mockResolvedValue(mockListings as any);
            vi.mocked(prisma.listing.count).mockResolvedValue(1);

            const result = await service.getAllListings({
                page: 1,
                pageSize: 10,
                sort: 'newest',
            });

            expect(result.data).toEqual(mockListings);
            expect(result.meta.total).toBe(1);
        });

        it('should filter by make', async () => {
            vi.mocked(prisma.listing.findMany).mockResolvedValue([] as any);
            vi.mocked(prisma.listing.count).mockResolvedValue(0);

            await service.getAllListings({
                page: 1,
                pageSize: 10,
                sort: 'newest',
                make: 'BMW',
            });

            expect(prisma.listing.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        make: { equals: 'BMW', mode: 'insensitive' },
                    }),
                })
            );
        });
    });

    describe('getListingById', () => {
        it('should return listing by id', async () => {
            const mockListing = { id: 'l1', make: 'BMW', status: 'ACTIVE' };
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);

            const result = await service.getListingById('l1');
            expect(result).toEqual(mockListing);
        });

        it('should throw NotFoundError if not found', async () => {
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(null);

            await expect(service.getListingById('999')).rejects.toThrow(NotFoundError);
        });
    });

    describe('createListing', () => {
        it('should create listing with PENDING status', async () => {
            const mockUser = { id: 'u1', role: 'INDIVIDUAL_SELLER' };
            const mockListing = { id: 'l1', make: 'BMW', status: 'PENDING' };
            
            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
            vi.mocked(prisma.listing.count).mockResolvedValue(0);
            vi.mocked(prisma.listing.create).mockResolvedValue(mockListing as any);

            const result = await service.createListing('u1', {
                make: 'BMW',
                model: 'X5',
                year: 2020,
                price: 30000,
                mileage: 50000,
                fuelType: 'Petrol',
                transmission: 'Automatic',
                bodyType: 'SUV',
                colorExterior: 'Black',
                condition: 'Used',
                location: 'Tallinn',
            } as any);

            expect(result.status).toBe('PENDING');
            expect(prisma.listing.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        make: 'BMW',
                        userId: 'u1',
                        status: 'PENDING',
                    }),
                })
            );
        });

        it('should throw NotFoundError if user not found', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            await expect(service.createListing('999', { make: 'BMW' } as any))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('updateListing', () => {
        it('should update listing for owner', async () => {
            const mockListing = { id: 'l1', userId: 'u1', make: 'BMW' };
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);
            vi.mocked(prisma.listing.update).mockResolvedValue({ ...mockListing, price: 35000 } as any);

            const result = await service.updateListing('l1', 'u1', false, { price: 35000 });
            expect(result.price).toBe(35000);
        });

        it('should allow admin to update any listing', async () => {
            const mockListing = { id: 'l1', userId: 'u1', make: 'BMW' };
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);
            vi.mocked(prisma.listing.update).mockResolvedValue(mockListing as any);

            await service.updateListing('l1', 'admin', true, { price: 35000 });
            expect(prisma.listing.update).toHaveBeenCalled();
        });

        it('should throw ForbiddenError for non-owner non-admin', async () => {
            const mockListing = { id: 'l1', userId: 'u1', make: 'BMW' };
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);

            await expect(service.updateListing('l1', 'u2', false, { price: 35000 }))
                .rejects.toThrow(ForbiddenError);
        });
    });

    describe('deleteListing', () => {
        it('should delete listing for owner', async () => {
            const mockListing = { id: 'l1', userId: 'u1' };
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);
            vi.mocked(prisma.listing.delete).mockResolvedValue(mockListing as any);

            await service.deleteListing('l1', 'u1', false);
            expect(prisma.listing.delete).toHaveBeenCalledWith({ where: { id: 'l1' } });
        });

        it('should allow admin to delete any listing', async () => {
            const mockListing = { id: 'l1', userId: 'u1' };
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);
            vi.mocked(prisma.listing.delete).mockResolvedValue(mockListing as any);

            await service.deleteListing('l1', 'admin', true);
            expect(prisma.listing.delete).toHaveBeenCalled();
        });

        it('should throw ForbiddenError for non-owner non-admin', async () => {
            const mockListing = { id: 'l1', userId: 'u1' };
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);

            await expect(service.deleteListing('l1', 'u2', false))
                .rejects.toThrow(ForbiddenError);
        });
    });
});
