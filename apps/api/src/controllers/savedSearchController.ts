import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

import { savedSearchService } from "../services/savedSearchService";

/**
 * GET /api/user/saved-searches
 * Get all saved searches for the authenticated user.
 */
export async function getSavedSearches(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const searches = await savedSearchService.getSavedSearches(userId);
        res.json({ data: searches });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/user/saved-searches
 * Create a new saved search.
 */
export async function createSavedSearch(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const { name, filters, emailAlerts } = req.body;

        if (!name || typeof name !== "string") {
            res.status(400).json({ error: "Name is required" });
            return;
        }

        if (!filters || typeof filters !== "object") {
            res.status(400).json({ error: "Filters object is required" });
            return;
        }

        const search = await savedSearchService.createSavedSearch(userId, {
            name,
            filters: filters as Prisma.InputJsonValue,
            emailAlerts,
        });

        res.status(201).json({ data: search });
    } catch (error) {
        if (error instanceof Error && error.message === "Maximum 20 saved searches allowed") {
            res.status(400).json({ error: error.message });
            return;
        }
        next(error);
    }
}

/**
 * PATCH /api/user/saved-searches/:id
 * Update a saved search (name or emailAlerts).
 */
export async function updateSavedSearch(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const id = req.params.id as string;
        const { name, emailAlerts } = req.body;

        const search = await savedSearchService.updateSavedSearch(id, userId, {
            name,
            emailAlerts,
        });

        res.json({ data: search });
    } catch (error) {
        if (error instanceof Error && error.message === "Saved search not found") {
            res.status(404).json({ error: error.message });
            return;
        }
        next(error);
    }
}

/**
 * DELETE /api/user/saved-searches/:id
 * Delete a saved search.
 */
export async function deleteSavedSearch(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const id = req.params.id as string;

        await savedSearchService.deleteSavedSearch(id, userId);

        res.json({ data: { message: "Saved search deleted" } });
    } catch (error) {
        if (error instanceof Error && error.message === "Saved search not found") {
            res.status(404).json({ error: error.message });
            return;
        }
        next(error);
    }
}
