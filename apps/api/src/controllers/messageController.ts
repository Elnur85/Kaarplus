import { Request, Response, NextFunction } from "express";

import { messageService } from "../services/messageService";

/**
 * GET /api/user/messages
 * Get all conversations for the authenticated user.
 */
export async function getConversations(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const conversations = await messageService.getConversations(userId);

        res.json({ data: conversations });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/user/messages/thread?userId=X&listingId=Y
 * Get messages in a conversation thread with another user.
 */
export async function getThread(req: Request, res: Response, next: NextFunction) {
    try {
        const currentUserId = req.user!.id;
        const otherUserId = req.query.userId as string;
        const listingId = req.query.listingId as string | undefined;

        if (!otherUserId) {
            res.status(400).json({ error: "userId query parameter is required" });
            return;
        }

        const messages = await messageService.getThread(currentUserId, otherUserId, listingId);

        res.json({ data: messages });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/user/messages
 * Send a message to another user.
 */
export async function sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
        const senderId = req.user!.id;
        const { recipientId, listingId, subject, body } = req.body;

        if (!recipientId) {
            res.status(400).json({ error: "recipientId is required" });
            return;
        }

        if (!body || typeof body !== "string" || body.trim().length === 0) {
            res.status(400).json({ error: "Message body is required and cannot be empty" });
            return;
        }

        const message = await messageService.sendMessage(senderId, {
            recipientId,
            listingId,
            subject,
            body: body.trim(),
        });

        res.status(201).json({ data: message });
    } catch (error) {
        if (error instanceof Error && error.message === "CANNOT_MESSAGE_SELF") {
            res.status(400).json({ error: "Ei saa saata s\u00F5numit iseendale" });
            return;
        }
        next(error);
    }
}

/**
 * GET /api/user/messages/unread-count
 * Get the count of unread messages for the authenticated user.
 */
export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const count = await messageService.getUnreadCount(userId);

        res.json({ data: { count } });
    } catch (error) {
        next(error);
    }
}
