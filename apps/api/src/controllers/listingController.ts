import { Request, Response } from "express";

import {
    createListingSchema,
    updateListingSchema,
    listingQuerySchema,
    contactSellerSchema,
    addImagesSchema,
    reorderImagesSchema,
} from "../schemas/listing";
import { AdService } from "../services/adService";
import { ListingService, ListingQuery } from "../services/listingService";
import { SearchService } from "../services/searchService";
import { BadRequestError } from "../utils/errors";

const listingService = new ListingService();
const adService = new AdService();
const searchService = new SearchService();

export const getAllListings = async (req: Request, res: Response) => {
    const result = listingQuerySchema.safeParse(req.query);
    if (!result.success) {
        throw new BadRequestError(result.error.issues[0].message);
    }

    const isAdmin = req.user?.role === "ADMIN";
    const listings = await listingService.getAllListings(result.data as ListingQuery, isAdmin) as any;

    // If it's the first page and not admin view, prepend sponsored listings
    if (!isAdmin && result.data.page === 1) {
        try {
            const context = {
                fuelType: result.data.fuelType,
                bodyType: result.data.bodyType,
            };
            const sponsoredData = await adService.getSponsoredListingsForSearch(context);

            if (sponsoredData && sponsoredData.length > 0) {
                const sponsoredListings = sponsoredData.map(s => ({
                    ...s.listing,
                    isSponsored: true
                }));

                // filter out sponsored listings if they already exist in standard listings to avoid duplicates
                const sponsoredIds = new Set(sponsoredListings.map(l => l.id));
                listings.data = [
                    ...sponsoredListings,
                    ...listings.data.filter((l: any) => !sponsoredIds.has(l.id))
                ];

                // Update total count if needed (optional, usually sponsored are "extra")
                // listings.total += sponsoredListings.length;
            }
        } catch (error) {
            // Log error but don't fail the request - ads are non-critical
            console.error("[ListingController] Failed to fetch sponsored listings:", error);
        }
    }

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
    res.status(200).json({ message: "Message sent successfully" });
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
    res.status(200).json({ message: "Images reordered successfully" });
};

export const deleteImage = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";
    await listingService.deleteImage(req.params.id as string, req.params.imageId as string, userId, isAdmin);
    res.status(204).send();
};

/**
 * Get all filter options for the search functionality
 * Returns makes, models grouped by make, years, body types, fuel types, etc.
 */
export const getFilterOptions = async (req: Request, res: Response) => {
    const options = await searchService.getFilterOptions();
    res.json({ data: options });
};

/**
 * Get featured listings for the home page (newest, electric, hybrid)
 */
export const getFeaturedListings = async (req: Request, res: Response) => {
    const { category = 'all', limit = '8' } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10) || 8, 20);

    let listings;
    
    switch (category) {
        case 'electric':
            listings = await listingService.getListingsByFuelType('Electric', limitNum);
            break;
        case 'hybrid':
            listings = await listingService.getListingsByFuelType('Hybrid', limitNum);
            break;
        case 'newest':
        default:
            listings = await listingService.getNewestListings(limitNum);
            break;
    }

    res.json({ data: listings });
};

/**
 * Get body type counts for category grid
 */
export const getBodyTypeCounts = async (_req: Request, res: Response) => {
    const bodyTypes = await listingService.getBodyTypeCounts();
    res.json({ data: bodyTypes });
};
