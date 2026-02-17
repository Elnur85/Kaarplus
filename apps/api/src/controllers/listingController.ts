import { Request, Response } from "express";

import {
    createListingSchema,
    updateListingSchema,
    listingQuerySchema,
    contactSellerSchema,
    addImagesSchema,
    reorderImagesSchema,
} from "../schemas/listing";
import { ListingService, ListingQuery } from "../services/listingService";
import { BadRequestError } from "../utils/errors";

const listingService = new ListingService();

export const getAllListings = async (req: Request, res: Response) => {
    const result = listingQuerySchema.safeParse(req.query);
    if (!result.success) {
        throw new BadRequestError(result.error.issues[0].message);
    }

    const isAdmin = req.user?.role === "ADMIN";
    const listings = await listingService.getAllListings(result.data as ListingQuery, isAdmin);
    res.json(listings);
};

export const getListingById = async (req: Request, res: Response) => {
    const listing = await listingService.getListingById(req.params.id as string);
    res.json({ data: listing });
};

export const createListing = async (req: Request, res: Response) => {
    const result = createListingSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestError(result.error.issues[0].message);
    }

    const userId = req.user!.id;
    const listing = await listingService.createListing(userId, result.data);
    res.status(201).json({ data: listing });
};

export const updateListing = async (req: Request, res: Response) => {
    const result = updateListingSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestError(result.error.issues[0].message);
    }

    const userId = req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";
    const listing = await listingService.updateListing(req.params.id as string, userId, isAdmin, result.data);
    res.json({ data: listing });
};

export const deleteListing = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";
    await listingService.deleteListing(req.params.id as string, userId, isAdmin);
    res.status(204).send();
};

export const getSimilarListings = async (req: Request, res: Response) => {
    const listings = await listingService.getSimilarListings(req.params.id as string);
    res.json({ data: listings });
};

export const contactSeller = async (req: Request, res: Response) => {
    const result = contactSellerSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestError(result.error.issues[0].message);
    }

    // Pass sender ID if user is authenticated
    const senderId = req.user?.id;
    await listingService.contactSeller(req.params.id as string, result.data, senderId);
    res.status(200).json({ message: "Sõnum saadetud" });
};

export const addImages = async (req: Request, res: Response) => {
    const result = addImagesSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestError(result.error.issues[0].message);
    }

    const userId = req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";
    const images = await listingService.addImages(req.params.id as string, userId, isAdmin, result.data.images);
    res.status(201).json({ data: images });
};

export const reorderImages = async (req: Request, res: Response) => {
    const result = reorderImagesSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestError(result.error.issues[0].message);
    }

    const userId = req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";
    await listingService.reorderImages(req.params.id as string, userId, isAdmin, result.data.imageOrders);
    res.status(200).json({ message: "Pildid ümber järjestatud" });
};

export const deleteImage = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";
    await listingService.deleteImage(req.params.id as string, req.params.imageId as string, userId, isAdmin);
    res.status(204).send();
};
