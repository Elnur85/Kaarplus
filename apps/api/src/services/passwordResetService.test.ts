import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock must be before imports
vi.mock('@kaarplus/database', () => ({
    prisma: {
        passwordResetToken: {
            updateMany: vi.fn(),
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            deleteMany: vi.fn(),
        },
    },
}));

import { passwordResetService } from './passwordResetService';
import { prisma } from '@kaarplus/database';

describe('passwordResetService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createResetToken', () => {
        it('should invalidate existing tokens and create new token', async () => {
            const email = 'test@example.com';
            vi.mocked(prisma.passwordResetToken.updateMany).mockResolvedValue({ count: 1 } as any);
            vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({
                id: 'token-1',
                email,
                token: 'new-token',
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            } as any);

            const result = await passwordResetService.createResetToken(email);

            expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
                where: { email, used: false },
                data: { used: true },
            });
            expect(prisma.passwordResetToken.create).toHaveBeenCalled();
            expect(result).toBeTruthy();
            expect(result).toHaveLength(64); // 32 bytes hex = 64 chars
        });

        it('should create token with 24 hour expiration', async () => {
            const email = 'test@example.com';
            vi.mocked(prisma.passwordResetToken.updateMany).mockResolvedValue({ count: 0 } as any);
            
            let capturedExpires: Date | null = null;
            vi.mocked(prisma.passwordResetToken.create).mockImplementation((args: any) => {
                capturedExpires = args.data.expires;
                return Promise.resolve({ id: 'token-1', ...args.data });
            });

            await passwordResetService.createResetToken(email);

            expect(capturedExpires).not.toBeNull();
            const hoursFromNow = (capturedExpires!.getTime() - Date.now()) / (1000 * 60 * 60);
            expect(hoursFromNow).toBeCloseTo(24, 0);
        });
    });

    describe('validateToken', () => {
        it('should return email for valid unused token', async () => {
            const token = 'valid-token';
            const email = 'test@example.com';
            const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

            vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
                id: 'token-1',
                email,
                token,
                expires: futureDate,
                used: false,
            } as any);

            const result = await passwordResetService.validateToken(token);

            expect(result).toBe(email);
        });

        it('should return null for non-existent token', async () => {
            vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(null);

            const result = await passwordResetService.validateToken('non-existent');

            expect(result).toBeNull();
        });

        it('should return null for used token', async () => {
            const token = 'used-token';
            vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
                id: 'token-1',
                email: 'test@example.com',
                token,
                expires: new Date(Date.now() + 60 * 60 * 1000),
                used: true,
            } as any);

            const result = await passwordResetService.validateToken(token);

            expect(result).toBeNull();
        });

        it('should return null for expired token', async () => {
            const token = 'expired-token';
            const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

            vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
                id: 'token-1',
                email: 'test@example.com',
                token,
                expires: pastDate,
                used: false,
            } as any);

            const result = await passwordResetService.validateToken(token);

            expect(result).toBeNull();
        });
    });

    describe('markTokenAsUsed', () => {
        it('should mark token as used', async () => {
            const token = 'token-to-mark';
            vi.mocked(prisma.passwordResetToken.update).mockResolvedValue({ id: 'token-1', used: true } as any);

            await passwordResetService.markTokenAsUsed(token);

            expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
                where: { token },
                data: { used: true },
            });
        });
    });

    describe('cleanupExpiredTokens', () => {
        it('should delete expired and old tokens', async () => {
            vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValue({ count: 5 } as any);

            await passwordResetService.cleanupExpiredTokens();

            expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { expires: expect.any(Object), used: false },
                        { createdAt: expect.any(Object) },
                    ],
                },
            });
        });
    });
});
