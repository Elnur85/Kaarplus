import { prisma } from "@kaarplus/database";

import { emailService } from "./emailService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_LANGUAGES = ["et", "ru", "en"];

export class NewsletterService {
    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        return EMAIL_REGEX.test(email);
    }

    /**
     * Normalize and validate language code
     */
    private getValidLanguage(language?: string): string {
        return VALID_LANGUAGES.includes(language || "") ? language! : "et";
    }

    /**
     * Subscribe to newsletter
     */
    async subscribe(email: string, language?: string) {
        if (!email || !this.isValidEmail(email)) {
            throw new Error("INVALID_EMAIL");
        }

        const normalizedEmail = email.toLowerCase().trim();
        const lang = this.getValidLanguage(language);

        // Check if already subscribed
        const existing = await prisma.newsletter.findUnique({
            where: { email: normalizedEmail },
        });

        if (existing) {
            if (!existing.active) {
                // Reactivate
                await prisma.newsletter.update({
                    where: { id: existing.id },
                    data: { active: true, language: lang },
                });
            }
            return { message: "Subscribed", subscribed: true };
        }

        const subscription = await prisma.newsletter.create({
            data: {
                email: normalizedEmail,
                language: lang,
            },
        });

        // Send welcome email (non-blocking)
        emailService.sendNewsletterWelcome(subscription.email, subscription.token, lang).catch(() => {});

        return { message: "Subscribed", subscribed: true };
    }

    /**
     * Unsubscribe from newsletter using token
     */
    async unsubscribe(token: string) {
        if (!token || typeof token !== "string") {
            throw new Error("INVALID_TOKEN");
        }

        const subscription = await prisma.newsletter.findUnique({
            where: { token },
        });

        if (!subscription) {
            throw new Error("TOKEN_NOT_FOUND");
        }

        if (!subscription.active) {
            return { message: "Already unsubscribed" };
        }

        await prisma.newsletter.update({
            where: { id: subscription.id },
            data: { active: false },
        });

        return { message: "Successfully unsubscribed" };
    }

    /**
     * Get all active subscribers
     */
    async getActiveSubscribers() {
        return prisma.newsletter.findMany({
            where: { active: true },
            select: { email: true, language: true },
        });
    }
}

export const newsletterService = new NewsletterService();
