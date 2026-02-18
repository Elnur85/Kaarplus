import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock must be before importing the service
vi.mock('@kaarplus/database', () => ({
    prisma: {
        gdprConsent: {
            upsert: vi.fn(),
            deleteMany: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        listing: {
            updateMany: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

import { gdprService } from './gdprService';

import { prisma } from '@kaarplus/database';

describe('GdprService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('saveConsent', () => {
        it('should upsert consent', async () => {
            const input = { userId: 'u1', marketing: true, analytics: false, ipAddress: '1.1.1.1' };
            vi.mocked(prisma.gdprConsent.upsert).mockResolvedValue(input as any);

            const result = await gdprService.saveConsent(input);
            expect(result).toEqual(input);
            expect(prisma.gdprConsent.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: 'u1' },
                create: expect.objectContaining({ marketing: true }),
                update: expect.objectContaining({ marketing: true }),
            }));
        });
    });

    describe('exportUserData', () => {
        it('should export user data', async () => {
            const userId = 'u1';
            const mockUser = { 
                id: userId, 
                email: 'test@example.com',
                listings: [],
                gdprConsent: null,
            };
            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

            const result = await gdprService.exportUserData(userId);
            expect(result).toBeDefined();
            expect(result.profile?.id).toBe(userId);
        });
    });
});
