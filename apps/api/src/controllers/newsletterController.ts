import { prisma } from "@kaarplus/database";
import { Request, Response, NextFunction } from "express";

import { emailService } from "../services/emailService";
import { BadRequestError } from "../utils/errors";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_LANGUAGES = ["et", "ru", "en"];

/**
 * POST /api/newsletter/subscribe
 * Subscribe to the newsletter (public, no auth required).
 */
export async function subscribe(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, language } = req.body;

        if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
            throw new BadRequestError("A valid email address is required");
        }

        const lang = VALID_LANGUAGES.includes(language) ? language : "et";

        // Check if already subscribed
        const existing = await prisma.newsletter.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existing) {
            if (existing.active) {
                res.json({ data: { message: "Already subscribed", subscribed: true } });
                return;
            }

            // Reactivate
            await prisma.newsletter.update({
                where: { id: existing.id },
                data: { active: true, language: lang },
            });

            res.json({ data: { message: "Subscription reactivated", subscribed: true } });
            return;
        }

        const subscription = await prisma.newsletter.create({
            data: {
                email: email.toLowerCase(),
                language: lang,
            },
        });

        // Send welcome email (non-blocking)
        emailService.sendNewsletterWelcome(subscription.email, subscription.token, lang).catch(() => {});

        res.status(201).json({ data: { message: "Successfully subscribed", subscribed: true } });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/newsletter/unsubscribe?token=X
 * Unsubscribe from the newsletter (public, no auth required).
 */
export async function unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.query;

        if (!token || typeof token !== "string") {
            throw new BadRequestError("Unsubscribe token is required");
        }

        const subscription = await prisma.newsletter.findUnique({
            where: { token },
        });

        if (!subscription) {
            throw new BadRequestError("Invalid unsubscribe token");
        }

        if (!subscription.active) {
            res.json({ data: { message: "Already unsubscribed" } });
            return;
        }

        await prisma.newsletter.update({
            where: { id: subscription.id },
            data: { active: false },
        });

        res.json({ data: { message: "Successfully unsubscribed" } });
    } catch (error) {
        next(error);
    }
}
