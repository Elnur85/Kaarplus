import { z } from "zod";

export const verifyListingSchema = z.object({
    action: z.enum(["approve", "reject"]),
    reason: z.string().optional(),
});

export const updateInspectionSchema = z.object({
    // Must match InspectionStatus enum — service enforces valid state transitions
    status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    inspectorNotes: z.string().max(2000).optional(),
    reportUrl: z.string().url("Invalid report URL").optional(),
    scheduledAt: z.string().datetime({ offset: true }).optional(),
});

export const adminQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
