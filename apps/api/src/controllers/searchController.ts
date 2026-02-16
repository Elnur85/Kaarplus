import { Request, Response } from "express";

import { SearchService } from "../services/searchService";

const searchService = new SearchService();

export const getMakes = async (_req: Request, res: Response) => {
    const makes = await searchService.getMakes();
    res.json({ data: makes });
};

export const getModels = async (req: Request, res: Response) => {
    const { make } = req.query;
    if (!make || typeof make !== "string") {
        res.json({ data: [] });
        return;
    }
    const models = await searchService.getModels(make);
    res.json({ data: models });
};

export const getFilterOptions = async (_req: Request, res: Response) => {
    const options = await searchService.getFilterOptions();
    res.json({ data: options });
};

export const getLocations = async (_req: Request, res: Response) => {
    const locations = await searchService.getLocations();
    res.json({ data: locations });
};

export const getColors = async (_req: Request, res: Response) => {
    const colors = await searchService.getColors();
    res.json({ data: colors });
};

export const getDriveTypes = async (_req: Request, res: Response) => {
    const driveTypes = await searchService.getDriveTypes();
    res.json({ data: driveTypes });
};
