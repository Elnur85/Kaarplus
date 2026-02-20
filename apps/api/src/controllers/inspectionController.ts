import { InspectionStatus } from "@kaarplus/database";
import { Request, Response, NextFunction } from "express";

import { emailService } from "../services/emailService";
import { inspectionService } from "../services/inspectionService";
import { BadRequestError } from "../utils/errors";
import { logger } from "../utils/logger";

/**
 * GET /api/admin/inspections
 * Get all inspections with pagination (admin only).
 */
export async function getAllInspections(req: Request, res: Response, next: NextFunction) {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
        const status = req.query.status as string | undefined;

        const result = await inspectionService.getAllInspections(page, pageSize, status);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/user/inspections
 * Request a vehicle inspection (authenticated).
 */
export async function requestInspection(req: Request, res: Response, next: NextFunction) {
    try {
        const requesterId = req.user!.id;
        const { listingId } = req.body;

        if (!listingId || typeof listingId !== "string") {
            throw new BadRequestError("listingId is required");
        }

        const inspection = await inspectionService.requestInspection(requesterId, listingId);
        res.status(201).json({ data: inspection });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/user/inspections
 * Get all inspections for the current user (authenticated).
 */
export async function getMyInspections(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const result = await inspectionService.getInspectionsByUser(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/user/inspections/:id
 * Get a single inspection by ID (authenticated).
 */
export async function getInspection(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const userRole = req.user!.role;
        const result = await inspectionService.getInspectionById(req.params.id as string, userId, userRole);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/admin/inspections/:id
 * Update inspection status (admin only).
 * Body is validated by updateInspectionSchema middleware before reaching here.
 */
export async function updateInspectionStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { status, inspectorNotes, reportUrl, scheduledAt } = req.body as {
            status: InspectionStatus;
            inspectorNotes?: string;
            reportUrl?: string;
            scheduledAt?: string;
        };

        const result = await inspectionService.updateInspectionStatus(
            req.params.id as string,
            status,
            inspectorNotes,
            reportUrl,
            scheduledAt,
        );

        // Send email notification (non-blocking with proper error logging)
        if (result.requesterEmail) {
            emailService
                .sendInspectionStatusEmail(result.requesterEmail, result.listingTitle, status)
                .catch((err) => {
                    logger.error("Failed to send inspection status email", {
                        error: err instanceof Error ? err.message : "Unknown error",
                        email: result.requesterEmail,
                        inspectionId: req.params.id,
                    });
                });
        }

        res.json({ data: result.data });
    } catch (error) {
        next(error);
    }
}
