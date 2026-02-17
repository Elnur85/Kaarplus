import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock must be before importing the service
vi.mock('@kaarplus/database', () => ({
    prisma: {
        newsletter: {
            findUnique: vi.fn(),
            update: vi.fn(),
            create: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

vi.mock('./emailService', () => ({
    emailService: {
        sendNewsletterWelcome: vi.fn().mockResolvedValue(true),
    },
}));

import { newsletterService } from './newsletterService';
import { prisma } from '@kaarplus/database';
import { emailService } from './emailService';

describe('NewsletterService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('subscribe', () => {
        it('should create new subscription and send email', async () => {
            const email = 'test@test.com';
            vi.mocked(prisma.newsletter.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.newsletter.create).mockResolvedValue({ email, token: 'abc' } as any);

            await newsletterService.subscribe(email, 'en');

            expect(prisma.newsletter.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ email, language: 'en' }),
            }));
            expect(emailService.sendNewsletterWelcome).toHaveBeenCalled();
        });

        it('should reactivate existing subscription', async () => {
            const email = 'test@test.com';
            vi.mocked(prisma.newsletter.findUnique).mockResolvedValue({ 
                id: 'sub1',
                email, 
                active: false 
            } as any);
            vi.mocked(prisma.newsletter.update).mockResolvedValue({ email, active: true } as any);

            await newsletterService.subscribe(email, 'en');

            expect(prisma.newsletter.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'sub1' },
                data: expect.objectContaining({ active: true }),
            }));
        });
    });

    describe('unsubscribe', () => {
        it('should deactivate subscription by token', async () => {
            const token = 'abc123';
            vi.mocked(prisma.newsletter.findUnique).mockResolvedValue({ 
                id: 'sub1',
                email: 'test@test.com', 
                active: true 
            } as any);
            vi.mocked(prisma.newsletter.update).mockResolvedValue({ active: false } as any);

            await newsletterService.unsubscribe(token);

            expect(prisma.newsletter.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'sub1' },
                data: expect.objectContaining({ active: false }),
            }));
        });
    });
});
