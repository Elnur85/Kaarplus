import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../utils/errors';

// Mock must be before importing the service
vi.mock('@kaarplus/database', () => ({
    prisma: {
        user: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
        },
        listing: {
            findMany: vi.fn(),
        },
    },
}));

import { DealershipService } from './dealershipService';
import { prisma } from '@kaarplus/database';

describe('DealershipService', () => {
    let service: DealershipService;

    beforeEach(() => {
        service = new DealershipService();
        vi.clearAllMocks();
    });

    describe('getDealerships', () => {
        it('should return all dealerships', async () => {
            const mockDealerships = [{ id: '1', name: 'Auto' }];
            vi.mocked(prisma.user.findMany).mockResolvedValue(mockDealerships as any);

            const result = await service.getDealerships();
            expect(result).toEqual(mockDealerships);
            expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { role: 'DEALERSHIP', deletedAt: null },
            }));
        });
    });

    describe('getDealershipById', () => {
        it('should return dealership by id', async () => {
            const mockDealership = { id: '1', name: 'Auto', role: 'DEALERSHIP' };
            vi.mocked(prisma.user.findFirst).mockResolvedValue(mockDealership as any);

            const result = await service.getDealershipById('1');
            expect(result).toEqual(mockDealership);
        });

        it('should throw NotFoundError if dealership not found', async () => {
            vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

            await expect(service.getDealershipById('999')).rejects.toThrow(NotFoundError);
        });
    });

    describe('getDealershipListings', () => {
        it('should return dealership listings', async () => {
            const mockListings = [{ id: 'l1', make: 'Toyota' }];
            vi.mocked(prisma.listing.findMany).mockResolvedValue(mockListings as any);

            const result = await service.getDealershipListings('1');
            expect(result).toEqual(mockListings);
            expect(prisma.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: '1', status: 'ACTIVE' },
            }));
        });
    });
});
