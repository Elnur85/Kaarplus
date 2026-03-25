import { Request, Response, NextFunction } from "express";

import { SearchService, resolveTaxonomyScope } from "../services/searchService";

const searchService = new SearchService();

export const getMakes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const makes = await searchService.getMakes(resolveTaxonomyScope(req.query.scope));
        res.json({ data: makes });
    } catch (error) {
        next(error);
    }
};

export const getModels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { make } = req.query;
        if (!make || typeof make !== "string") {
            res.json({ data: [] });
            return;
        }
        const models = await searchService.getModels(make, resolveTaxonomyScope(req.query.scope));
        res.json({ data: models });
    } catch (error) {
        next(error);
    }
};

export const getFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const options = await searchService.getFilterOptions(resolveTaxonomyScope(req.query.scope));
        res.json({ data: options });
    } catch (error) {
        next(error);
    }
};

export const getLocations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const locations = await searchService.getLocations(resolveTaxonomyScope(req.query.scope));
        res.json({ data: locations });
    } catch (error) {
        next(error);
    }
};

export const getColors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const colors = await searchService.getColors(resolveTaxonomyScope(req.query.scope));
        res.json({ data: colors });
    } catch (error) {
        next(error);
    }
};

export const getDriveTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driveTypes = await searchService.getDriveTypes(resolveTaxonomyScope(req.query.scope));
        res.json({ data: driveTypes });
    } catch (error) {
        next(error);
    }
};

export const getPlatformStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await searchService.getPlatformStats();
        res.json({ data: stats });
    } catch (error) {
        next(error);
    }
};
