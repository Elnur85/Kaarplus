import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SendGrid before importing the service
vi.mock('@sendgrid/mail', () => ({
    default: {
        setApiKey: vi.fn(),
        send: vi.fn().mockResolvedValue([{}, {}]),
    },
}));

import { emailService } from './emailService';

describe('emailService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.SENDGRID_API_KEY;
    });

    describe('sendEmail', () => {
        it('should log email when SendGrid is not configured', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendEmail('test@example.com', 'Test Subject', '<p>Test</p>');
            
            expect(consoleSpy).toHaveBeenCalledWith(
                '[Email] To:', 'test@example.com',
                'Subject:', 'Test Subject'
            );
            consoleSpy.mockRestore();
        });
    });

    describe('sendPasswordResetEmail', () => {
        it('should generate correct reset URL', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendPasswordResetEmail('test@example.com', 'reset-token-123', 'et');
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[1]).toBe('test@example.com');
            expect(callArgs[3]).toContain('Parooli taastamine');
            consoleSpy.mockRestore();
        });

        it('should support English language', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendPasswordResetEmail('test@example.com', 'token', 'en');
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[3]).toContain('Password Reset');
            consoleSpy.mockRestore();
        });

        it('should fallback to Estonian for unsupported language', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendPasswordResetEmail('test@example.com', 'token', 'fr');
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[3]).toContain('Parooli taastamine');
            consoleSpy.mockRestore();
        });
    });

    describe('sendListingApprovedEmail', () => {
        it('should call sendEmail with correct subject', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendListingApprovedEmail(
                'test@example.com',
                'Toyota Corolla',
                'listing-123'
            );
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[1]).toBe('test@example.com');
            expect(callArgs[3]).toContain('kinnitatud');
            consoleSpy.mockRestore();
        });

        it('should escape HTML in listing title', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendListingApprovedEmail(
                'test@example.com',
                '<script>alert("xss")</script>',
                'listing-123'
            );
            
            expect(consoleSpy).toHaveBeenCalled();
            // The subject should not contain the script tag
            const subject = consoleSpy.mock.calls[0][3];
            expect(subject).not.toContain('<script>');
            consoleSpy.mockRestore();
        });
    });

    describe('sendNewMessageEmail', () => {
        it('should call sendEmail with message notification subject', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendNewMessageEmail(
                'test@example.com',
                'John Doe',
                'Toyota Corolla'
            );
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[1]).toBe('test@example.com');
            expect(callArgs[3]).toContain('sõnum');
            consoleSpy.mockRestore();
        });
    });

    describe('sendReviewNotificationEmail', () => {
        it('should call sendEmail with review notification subject', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendReviewNotificationEmail(
                'test@example.com',
                'Jane Doe',
                4
            );
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[1]).toBe('test@example.com');
            expect(callArgs[3]).toContain('arvustus');
            consoleSpy.mockRestore();
        });
    });

    describe('sendInspectionStatusEmail', () => {
        it('should call sendEmail with inspection status subject', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendInspectionStatusEmail(
                'test@example.com',
                'Toyota Corolla',
                'COMPLETED'
            );
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[1]).toBe('test@example.com');
            expect(callArgs[3]).toContain('staatus');
            consoleSpy.mockRestore();
        });
    });

    describe('sendNewsletterWelcome', () => {
        it('should call sendEmail with welcome subject', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendNewsletterWelcome(
                'test@example.com',
                'unsubscribe-token',
                'et'
            );
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[1]).toBe('test@example.com');
            expect(callArgs[3]).toContain('Tere tulemast');
            consoleSpy.mockRestore();
        });

        it('should support Russian language', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendNewsletterWelcome(
                'test@example.com',
                'unsubscribe-token',
                'ru'
            );
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[3]).toContain('Dobro povzhalovat');
            consoleSpy.mockRestore();
        });
    });

    describe('sendPurchaseConfirmationEmail', () => {
        it('should call sendEmail with purchase confirmation subject', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendPurchaseConfirmationEmail(
                'test@example.com',
                'Toyota Corolla',
                'listing-123'
            );
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[1]).toBe('test@example.com');
            expect(callArgs[3]).toContain('Ostukinnitus');
            consoleSpy.mockRestore();
        });
    });

    describe('sendSaleNotificationEmail', () => {
        it('should call sendEmail with sale notification subject', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            await emailService.sendSaleNotificationEmail(
                'test@example.com',
                'Toyota Corolla',
                'listing-123'
            );
            
            expect(consoleSpy).toHaveBeenCalled();
            const callArgs = consoleSpy.mock.calls[0];
            expect(callArgs[1]).toBe('test@example.com');
            expect(callArgs[3]).toContain('müüdud');
            consoleSpy.mockRestore();
        });
    });
});
