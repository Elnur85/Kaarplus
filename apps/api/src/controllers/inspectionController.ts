import { InspectionStatus } from "@kaarplus/database";
import { Request, Response, NextFunction } from "express";

import { emailService } from "../services/emailService";
import { inspectionService } from "../services/inspectionService";
import { BadRequestError } from "../utils/errors";

const VALID_STATUSES = Object.values(InspectionStatus);

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
 */
export async function updateInspectionStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { status, inspectorNotes, reportUrl } = req.body;

        if (!status || !VALID_STATUSES.includes(status as InspectionStatus)) {
            throw new BadRequestError(`status is required and must be one of: ${VALID_STATUSES.join(", ")}`);
        }

        const result = await inspectionService.updateInspectionStatus(
            req.params.id as string,
            status as InspectionStatus,
            inspectorNotes,
            reportUrl,
        );

        // Send email notification (non-blocking)
        if (result.requesterEmail) {
            emailService
                .sendInspectionStatusEmail(result.requesterEmail, result.listingTitle, status)
                .catch(() => {});
        }

        res.json({ data: result.data });
    } catch (error) {
        next(error);
    }
}
