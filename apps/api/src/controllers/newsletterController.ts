import { Request, Response, NextFunction } from "express";

import { newsletterService } from "../services/newsletterService";
import { BadRequestError } from "../utils/errors";

/**
 * POST /api/newsletter/subscribe
 * Subscribe to the newsletter (public, no auth required).
 */
export async function subscribe(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, language } = req.body;

        const result = await newsletterService.subscribe(email, language);
        res.json({ data: result });
    } catch (error) {
        if (error instanceof Error && error.message === "INVALID_EMAIL") {
            next(new BadRequestError("A valid email address is required"));
            return;
        }
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

        const result = await newsletterService.unsubscribe(token as string);
        res.json({ data: result });
    } catch (error) {
        if (error instanceof Error && error.message === "INVALID_TOKEN") {
            next(new BadRequestError("Unsubscribe token is required"));
            return;
        }
        if (error instanceof Error && error.message === "TOKEN_NOT_FOUND") {
            next(new BadRequestError("Invalid unsubscribe token"));
            return;
        }
        next(error);
    }
}
