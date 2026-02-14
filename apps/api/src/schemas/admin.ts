import { z } from "zod";

export const verifyListingSchema = z.object({
    action: z.enum(["approve", "reject"]),
    reason: z.string().optional(),
});

export const adminQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
