import { prisma } from "@kaarplus/database";
import { Request, Response, NextFunction } from "express";

import { ForbiddenError, NotFoundError, AuthError } from "../utils/errors";

/**
 * Middleware to ensure that the authenticated user owns the listing
 * or is an administrator.
 * 
 * Must be used after requireAuth middleware.
 */
export async function requireListingOwnership(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    try {
        const id = req.params.id as string;
        const user = req.user;

        if (!user) {
            return next(new AuthError("Authentication required"));
        }

        if (!id) {
            return next(new NotFoundError("Listing ID is required"));
        }

        const listing = await prisma.listing.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!listing) {
            return next(new NotFoundError("Listing not found"));
        }

        // Admins bypass ownership check
        if (user.role === "ADMIN") {
            return next();
        }

        // Check if authenticated user is the owner
        if (listing.userId !== user.id) {
            return next(new ForbiddenError("You do not have permission to modify this listing"));
        }

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Middleware to ensure that the authenticated user owns the message
 * or is an administrator.
 */
export async function requireMessageOwnership(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    try {
        const id = req.params.id as string;
        const user = req.user;

        if (!user) {
            return next(new AuthError("Authentication required"));
        }

        const message = await prisma.message.findUnique({
            where: { id },
            select: { senderId: true, recipientId: true },
        });

        if (!message) {
            return next(new NotFoundError("Message not found"));
        }

        if (user.role === "ADMIN") {
            return next();
        }

        if (message.senderId !== user.id && message.recipientId !== user.id) {
            return next(new ForbiddenError("You do not have permission to access this message"));
        }

        next();
    } catch (error) {
        next(error);
    }
}
