import { Request, Response } from "express";

import { AdService } from "../services/adService";
import { ListingService, ListingQuery } from "../services/listingService";
import { SearchService } from "../services/searchService";
import { logger } from "../utils/logger";
import { isAdmin, requireUserId } from "../utils/validation";

const listingService = new ListingService();
const adService = new AdService();
const searchService = new SearchService();

export const getAllListings = async (req: Request, res: Response) => {
  // Validation is handled by middleware, data is in req.validatedQuery
  const query = (req.validatedQuery || req.query) as unknown as ListingQuery;
  const admin = isAdmin(req);
  const listings = await listingService.getAllListings(query, admin);

  // If it's the first page and not admin view, prepend sponsored listings
  if (!admin && query.page === 1) {
    try {
      const context = {
        fuelType: query.fuelType,
        bodyType: query.bodyType,
      };
      const sponsoredData = await adService.getSponsoredListingsForSearch(context);

      if (sponsoredData && sponsoredData.length > 0) {
        const sponsoredListings = sponsoredData.map((s: any) => ({
          ...s.listing,
          isSponsored: true,
        }));

        // filter out sponsored listings if they already exist in standard listings to avoid duplicates
        const sponsoredIds = new Set(sponsoredListings.map((l: any) => l.id));
        listings.data = [
          ...sponsoredListings,
          ...listings.data.filter((l: any) => !(sponsoredIds.has((l as { id: string }).id))),
        ];
      }
    } catch (error) {
      // Log error but don't fail the request - ads are non-critical
      logger.warn("[ListingController] Failed to fetch sponsored listings", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  res.json(listings);
};

export const getListingById = async (req: Request, res: Response) => {
  const listing = await listingService.getListingById(String(req.params.id));
  res.json({ data: listing });
};

export const createListing = async (req: Request, res: Response) => {
  // Body is already validated by middleware
  const data = req.body;
  const userId = requireUserId(req);
  const listing = await listingService.createListing(userId, data);
  res.status(201).json({ data: listing });
};

export const updateListing = async (req: Request, res: Response) => {
  // Body is already validated by middleware
  const data = req.body;
  const userId = requireUserId(req);
  const admin = isAdmin(req);
  const listing = await listingService.updateListing(
    String(req.params.id),
    userId,
    admin,
    data
  );
  res.json({ data: listing });
};

export const deleteListing = async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const admin = isAdmin(req);
  await listingService.deleteListing(String(req.params.id), userId, admin);
  res.status(204).send();
};

export const getSimilarListings = async (req: Request, res: Response) => {
  const listings = await listingService.getSimilarListings(String(req.params.id));
  res.json({ data: listings });
};

export const contactSeller = async (req: Request, res: Response) => {
  // Body is already validated by middleware
  const data = req.body;
  // Pass sender ID if user is authenticated
  const senderId = getUserId(req);
  await listingService.contactSeller(String(req.params.id), data, senderId);
  res.status(200).json({ message: "Message sent successfully" });
};

export const addImages = async (req: Request, res: Response) => {
  // Body is already validated by middleware
  const { images } = req.body;
  const userId = requireUserId(req);
  const admin = isAdmin(req);
  const result = await listingService.addImages(
    String(req.params.id),
    userId,
    admin,
    images
  );
  res.status(201).json({ data: result });
};

export const reorderImages = async (req: Request, res: Response) => {
  // Body is already validated by middleware
  const { imageOrders } = req.body;
  const userId = requireUserId(req);
  const admin = isAdmin(req);
  await listingService.reorderImages(
    String(req.params.id),
    userId,
    admin,
    imageOrders
  );
  res.status(200).json({ message: "Images reordered successfully" });
};

export const deleteImage = async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const admin = isAdmin(req);
  await listingService.deleteImage(
    String(req.params.id),
    String(req.params.imageId),
    userId,
    admin
  );
  res.status(204).send();
};

/**
 * Get all filter options for the search functionality
 * Returns makes, models grouped by make, years, body types, fuel types, etc.
 */
export const getFilterOptions = async (_req: Request, res: Response) => {
  const options = await searchService.getFilterOptions();
  res.json({ data: options });
};

/**
 * Get featured listings for the home page (newest, electric, hybrid)
 */
export const getFeaturedListings = async (req: Request, res: Response) => {
  const category = String(req.query.category || "all");
  const limit = Math.min(parseInt(String(req.query.limit), 10) || 8, 20);

  let listings;

  switch (category) {
    case "electric":
      listings = await listingService.getListingsByFuelType("Electric", limit);
      break;
    case "hybrid":
      listings = await listingService.getListingsByFuelType("Hybrid", limit);
      break;
    case "newest":
    default:
      listings = await listingService.getNewestListings(limit);
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

// Helper to get optional user ID
function getUserId(req: Request): string | undefined {
  return req.user?.id;
}
