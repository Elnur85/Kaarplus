import { describe, it, expect, vi, beforeEach } from 'vitest';

import { NotFoundError } from '../utils/errors';

// Mock must be before importing the service
vi.mock('@kaarplus/database', () => ({
    prisma: {
        listing: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
        payment: {
            aggregate: vi.fn(),
            findMany: vi.fn(),
        },
        $queryRaw: vi.fn(),
    },
}));

vi.mock('./emailService', () => ({
    emailService: {
        sendListingApprovedEmail: vi.fn().mockResolvedValue(true),
    },
}));

import { AdminService } from './adminService';

import { prisma } from '@kaarplus/database';

import { emailService } from './emailService';

describe('AdminService', () => {
    let service: AdminService;

    beforeEach(() => {
        service = new AdminService();
        vi.clearAllMocks();
    });

    describe('getPendingListings', () => {
        it('should return paginated pending listings', async () => {
            const mockListings = [{ id: '1', status: 'PENDING' }];
            vi.mocked(prisma.listing.findMany).mockResolvedValue(mockListings as any);
            vi.mocked(prisma.listing.count).mockResolvedValue(1);

            const result = await service.getPendingListings(1, 10);
            expect(result.data).toEqual(mockListings);
            expect(result.meta.total).toBe(1);
        });
    });

    describe('verifyListing', () => {
        it('should approve listing and send email', async () => {
            const mockListing = { 
                id: '1', 
                status: 'PENDING',
                user: { email: 'seller@example.com' }
            };
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);
            vi.mocked(prisma.listing.update).mockResolvedValue({ ...mockListing, status: 'ACTIVE' } as any);

            const result = await service.verifyListing('1', 'approve');
            expect(result.status).toBe('ACTIVE');
            expect(emailService.sendListingApprovedEmail).toHaveBeenCalled();
        });

        it('should reject listing', async () => {
            const mockListing = { 
                id: '1', 
                status: 'PENDING',
                user: { email: 'seller@example.com' }
            };
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(mockListing as any);
            vi.mocked(prisma.listing.update).mockResolvedValue({ ...mockListing, status: 'REJECTED' } as any);

            const result = await service.verifyListing('1', 'reject', 'Incomplete description');
            expect(result.status).toBe('REJECTED');
        });

        it('should throw NotFoundError if listing not found', async () => {
            vi.mocked(prisma.listing.findUnique).mockResolvedValue(null);

            await expect(service.verifyListing('999', 'approve')).rejects.toThrow(NotFoundError);
        });
    });

    describe('getStats', () => {
        it('should return dashboard stats', async () => {
            vi.mocked(prisma.listing.count)
                .mockResolvedValueOnce(5)  // pending
                .mockResolvedValueOnce(10) // total
                .mockResolvedValueOnce(2); // verified today
            vi.mocked(prisma.user.count).mockResolvedValue(10);

            const result = await service.getStats();
            expect(result.pendingListings).toBe(5);
            expect(result.activeUsers).toBe(10);
            expect(result.totalListings).toBe(10);
            expect(result.verifiedToday).toBe(2);
        });
    });
});
