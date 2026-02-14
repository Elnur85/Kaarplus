import { Request, Response } from "express";

import { verifyListingSchema, adminQuerySchema } from "../schemas/admin";
import { AdminService } from "../services/adminService";
import { BadRequestError } from "../utils/errors";

const adminService = new AdminService();

export const getPendingListings = async (req: Request, res: Response) => {
    const query = adminQuerySchema.parse(req.query);
    const result = await adminService.getPendingListings(query.page, query.pageSize);
    res.json(result);
};

export const verifyListing = async (req: Request, res: Response) => {
    const result = verifyListingSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestError(result.error.issues[0].message);
    }

    const { action, reason } = result.data;
    const listing = await adminService.verifyListing(req.params.id as string, action, reason);

    res.json({ data: listing });
};

export const getUsers = async (req: Request, res: Response) => {
    const query = adminQuerySchema.parse(req.query);
    const result = await adminService.getUsers(query.page, query.pageSize);
    res.json(result);
};
