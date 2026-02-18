import { Request, Response } from "express";

import {
  adQuerySchema,
  createCampaignSchema,
  updateCampaignSchema,
  createAdSchema,
  updateAdSchema,
  trackEventSchema,
  analyticsQuerySchema,
} from "../schemas/ad";
import { AdService } from "../services/adService";
import { BadRequestError } from "../utils/errors";

const adService = new AdService();

// ─── Public Endpoints ─────────────────────────────────────────

export const getAdForPlacement = async (req: Request, res: Response) => {
  const placementId = req.params.placementId as string;
  const context = {
    fuelType: req.query.fuelType as string | undefined,
    bodyType: req.query.bodyType as string | undefined,
    make: req.query.make as string | undefined,
    location: req.query.location as string | undefined,
  };

  const ad = await adService.getAdForPlacement(placementId, context);
  res.json({ data: ad });
};

export const trackAdEvent = async (req: Request, res: Response) => {
  const result = trackEventSchema.safeParse(req.body);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }

  const id = req.params.id as string;
  const ip = req.ip || req.socket.remoteAddress;
  await adService.trackEvent(id, result.data.eventType, {
    userId: (req as unknown as { user?: { id: string } }).user?.id,
    device: result.data.device,
    locale: result.data.locale,
    ip,
    metadata: result.data.metadata,
  });

  res.status(204).send();
};

// ─── Admin: Campaigns ─────────────────────────────────────────

export const getCampaigns = async (req: Request, res: Response) => {
  const result = adQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }

  const { page, pageSize, status } = result.data;
  const response = await adService.getCampaigns(page, pageSize, status);
  res.json(response);
};

export const getCampaignById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const campaign = await adService.getCampaignById(id);
  res.json({ data: campaign });
};

export const createCampaign = async (req: Request, res: Response) => {
  const result = createCampaignSchema.safeParse(req.body);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }

  const campaign = await adService.createCampaign(result.data);
  res.status(201).json({ data: campaign });
};

export const updateCampaign = async (req: Request, res: Response) => {
  const result = updateCampaignSchema.safeParse(req.body);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }

  const id = req.params.id as string;
  const campaign = await adService.updateCampaign(id, result.data);
  res.json({ data: campaign });
};

export const archiveCampaign = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const campaign = await adService.archiveCampaign(id);
  res.json({ data: campaign });
};

export const getCampaignAnalytics = async (req: Request, res: Response) => {
  const result = analyticsQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }

  const id = req.params.id as string;
  const { startDate, endDate } = result.data;
  const analytics = await adService.getCampaignAnalytics(
    id,
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined
  );
  res.json({ data: analytics });
};

// ─── Admin: Advertisements ────────────────────────────────────

export const createAdvertisement = async (req: Request, res: Response) => {
  const result = createAdSchema.safeParse(req.body);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }

  const ad = await adService.createAdvertisement(result.data);
  res.status(201).json({ data: ad });
};

export const updateAdvertisement = async (req: Request, res: Response) => {
  const result = updateAdSchema.safeParse(req.body);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }

  const id = req.params.id as string;
  const ad = await adService.updateAdvertisement(id, result.data);
  res.json({ data: ad });
};

// ─── Admin: Ad Units & Overview ───────────────────────────────

export const getAdUnits = async (_req: Request, res: Response) => {
  const units = await adService.getAdUnits();
  res.json({ data: units });
};

export const getAnalyticsOverview = async (_req: Request, res: Response) => {
  const overview = await adService.getAnalyticsOverview();
  res.json({ data: overview });
};

// ─── Public: Sponsored Listings ───────────────────────────────

export const getSponsoredListings = async (req: Request, res: Response) => {
  const context = {
    fuelType: req.query.fuelType as string | undefined,
    bodyType: req.query.bodyType as string | undefined,
  };

  const listings = await adService.getSponsoredListingsForSearch(context);
  res.json({ data: listings });
};
