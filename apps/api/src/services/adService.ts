import crypto from "crypto";

import { prisma } from "@kaarplus/database";
import { Prisma } from "@prisma/client";

import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  CreateAdInput,
  UpdateAdInput,
} from "../schemas/ad";
import { NotFoundError, BadRequestError, ErrorCode } from "../utils/errors";

interface TargetingContext {
  fuelType?: string;
  bodyType?: string;
  make?: string;
  location?: string;
}

interface TargetingJson {
  fuelType?: string[];
  bodyType?: string[];
  make?: string[];
  location?: string[];
}

interface TrackEventData {
  userId?: string;
  device?: string;
  locale?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

export class AdService {
  /**
   * Priority Engine: Fetch the best active ad for a placement.
   * Level 1 (priority=1): Takeover — paid direct ads
   * Level 2 (priority=2): House — Kaarplus self-promotion
   * Level 3 (priority=3): Programmatic — Google AdSense fallback
   */
  async getAdForPlacement(
    placementId: string,
    context?: TargetingContext
  ) {
    const now = new Date();

    const adUnit = await prisma.adUnit.findUnique({
      where: { placementId, active: true },
    });
    if (!adUnit) return null;

    const advertisements = await prisma.advertisement.findMany({
      where: {
        adUnitId: adUnit.id,
        active: true,
        campaign: {
          status: "ACTIVE",
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
      include: {
        campaign: {
          select: {
            id: true,
            priority: true,
            targeting: true,
            budget: true,
            spent: true,
            dailyBudget: true,
          },
        },
        adUnit: {
          select: {
            placementId: true,
            width: true,
            height: true,
            type: true,
          },
        },
      },
      orderBy: { campaign: { priority: "asc" } },
    });

    // Filter out over-budget campaigns
    const withinBudget = advertisements.filter(
      (ad) =>
        Number(ad.campaign.budget) === 0 ||
        Number(ad.campaign.spent) < Number(ad.campaign.budget)
    );

    // Apply targeting context filter
    const matched = withinBudget.filter((ad) => {
      const targeting = ad.campaign.targeting as TargetingJson | null;
      if (!targeting || Object.keys(targeting).length === 0) return true;

      if (
        context?.fuelType &&
        targeting.fuelType?.length &&
        !targeting.fuelType.includes(context.fuelType)
      )
        return false;
      if (
        context?.bodyType &&
        targeting.bodyType?.length &&
        !targeting.bodyType.includes(context.bodyType)
      )
        return false;
      if (
        context?.make &&
        targeting.make?.length &&
        !targeting.make.includes(context.make)
      )
        return false;
      if (
        context?.location &&
        targeting.location?.length &&
        !targeting.location.includes(context.location)
      )
        return false;

      return true;
    });

    if (matched.length === 0) return null;

    // Pick random ad within the highest-priority tier
    const topPriority = matched[0].campaign.priority;
    const topTier = matched.filter(
      (a) => a.campaign.priority === topPriority
    );
    const selected = topTier[Math.floor(Math.random() * topTier.length)];

    return {
      id: selected.id,
      title: selected.title,
      imageUrl: selected.imageUrl,
      imageUrlMobile: selected.imageUrlMobile,
      linkUrl: selected.linkUrl,
      adSenseSnippet: selected.adSenseSnippet,
      campaign: {
        id: selected.campaign.id,
        priority: selected.campaign.priority,
      },
      adUnit: selected.adUnit,
    };
  }

  /**
   * Track an ad impression or click event.
   */
  async trackEvent(adId: string, eventType: "IMPRESSION" | "CLICK", data: TrackEventData) {
    const ad = await prisma.advertisement.findUnique({
      where: { id: adId },
    });
    if (!ad) {
      throw new NotFoundError(
        "Advertisement not found",
        ErrorCode.AD_NOT_FOUND
      );
    }

    const ipHash = data.ip
      ? crypto
          .createHash("sha256")
          .update(data.ip)
          .digest("hex")
          .substring(0, 16)
      : null;

    await prisma.adAnalytics.create({
      data: {
        advertisementId: adId,
        eventType,
        userId: data.userId || null,
        device: data.device || null,
        locale: data.locale || null,
        ipHash,
        metadata: (data.metadata as Prisma.InputJsonValue) || {},
      },
    });
  }

  // ─── Campaign CRUD ──────────────────────────────────────────

  async getCampaigns(
    page: number = 1,
    pageSize: number = 20,
    statusFilter?: string
  ) {
    const skip = (page - 1) * pageSize;
    const where = statusFilter ? { status: statusFilter as never } : {};

    const [campaigns, total] = await Promise.all([
      prisma.adCampaign.findMany({
        where,
        include: {
          advertiser: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { advertisements: true, sponsoredListings: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.adCampaign.count({ where }),
    ]);

    return {
      data: campaigns,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getCampaignById(id: string) {
    const campaign = await prisma.adCampaign.findUnique({
      where: { id },
      include: {
        advertiser: {
          select: { id: true, name: true, email: true },
        },
        advertisements: {
          include: {
            adUnit: {
              select: { placementId: true, name: true, type: true, width: true, height: true },
            },
            _count: { select: { analytics: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        sponsoredListings: {
          include: {
            listing: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                price: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundError(
        "Campaign not found",
        ErrorCode.CAMPAIGN_NOT_FOUND
      );
    }

    return campaign;
  }

  async createCampaign(data: CreateCampaignInput) {
    const advertiser = await prisma.user.findUnique({
      where: { id: data.advertiserId },
    });
    if (!advertiser) {
      throw new NotFoundError(
        "Advertiser not found",
        ErrorCode.USER_NOT_FOUND
      );
    }

    return prisma.adCampaign.create({
      data: {
        advertiserId: data.advertiserId,
        name: data.name,
        budget: data.budget,
        dailyBudget: data.dailyBudget,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status,
        priority: data.priority,
        targeting: data.targeting as Prisma.InputJsonValue,
      },
    });
  }

  async updateCampaign(id: string, data: UpdateCampaignInput) {
    const existing = await prisma.adCampaign.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(
        "Campaign not found",
        ErrorCode.CAMPAIGN_NOT_FOUND
      );
    }

    if (existing.status === "ARCHIVED") {
      throw new BadRequestError(
        "Cannot update an archived campaign",
        ErrorCode.CAMPAIGN_NOT_FOUND
      );
    }

    const updateData: Prisma.AdCampaignUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.dailyBudget !== undefined) updateData.dailyBudget = data.dailyBudget;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.targeting !== undefined)
      updateData.targeting = data.targeting as Prisma.InputJsonValue;

    return prisma.adCampaign.update({ where: { id }, data: updateData });
  }

  async archiveCampaign(id: string) {
    const existing = await prisma.adCampaign.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(
        "Campaign not found",
        ErrorCode.CAMPAIGN_NOT_FOUND
      );
    }

    // Archive campaign and deactivate all its advertisements
    const [campaign] = await prisma.$transaction([
      prisma.adCampaign.update({
        where: { id },
        data: { status: "ARCHIVED" },
      }),
      prisma.advertisement.updateMany({
        where: { campaignId: id },
        data: { active: false },
      }),
      prisma.sponsoredListing.updateMany({
        where: { campaignId: id },
        data: { active: false },
      }),
    ]);

    return campaign;
  }

  // ─── Campaign Analytics ─────────────────────────────────────

  async getCampaignAnalytics(
    campaignId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const campaign = await prisma.adCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    });
    if (!campaign) {
      throw new NotFoundError(
        "Campaign not found",
        ErrorCode.CAMPAIGN_NOT_FOUND
      );
    }

    const adIds = await prisma.advertisement.findMany({
      where: { campaignId },
      select: { id: true },
    });
    const advertisementIds = adIds.map((a) => a.id);

    if (advertisementIds.length === 0) {
      return { timeSeries: [], totals: { impressions: 0, clicks: 0, ctr: 0 } };
    }

    const dateFilter: Prisma.AdAnalyticsWhereInput = {
      advertisementId: { in: advertisementIds },
    };
    if (startDate) dateFilter.createdAt = { ...dateFilter.createdAt as object, gte: startDate };
    if (endDate)
      dateFilter.createdAt = { ...dateFilter.createdAt as object, lte: endDate };

    const [impressions, clicks, timeSeries] = await Promise.all([
      prisma.adAnalytics.count({
        where: { ...dateFilter, eventType: "IMPRESSION" },
      }),
      prisma.adAnalytics.count({
        where: { ...dateFilter, eventType: "CLICK" },
      }),
      prisma.$queryRaw<Array<{ date: Date; impressions: bigint; clicks: bigint }>>`
        SELECT
          DATE("createdAt") as date,
          COUNT(*) FILTER (WHERE "eventType" = 'IMPRESSION') as impressions,
          COUNT(*) FILTER (WHERE "eventType" = 'CLICK') as clicks
        FROM "AdAnalytics"
        WHERE "advertisementId" = ANY(${advertisementIds}::text[])
          ${startDate ? Prisma.sql`AND "createdAt" >= ${startDate}` : Prisma.sql``}
          ${endDate ? Prisma.sql`AND "createdAt" <= ${endDate}` : Prisma.sql``}
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") ASC
      `,
    ]);

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return {
      timeSeries: timeSeries.map((row) => ({
        date: row.date,
        impressions: Number(row.impressions),
        clicks: Number(row.clicks),
      })),
      totals: {
        impressions,
        clicks,
        ctr: Math.round(ctr * 100) / 100,
      },
    };
  }

  // ─── Advertisements ─────────────────────────────────────────

  async createAdvertisement(data: CreateAdInput) {
    const [campaign, adUnit] = await Promise.all([
      prisma.adCampaign.findUnique({ where: { id: data.campaignId } }),
      prisma.adUnit.findUnique({ where: { id: data.adUnitId } }),
    ]);

    if (!campaign) {
      throw new NotFoundError(
        "Campaign not found",
        ErrorCode.CAMPAIGN_NOT_FOUND
      );
    }
    if (!adUnit) {
      throw new NotFoundError(
        "Ad unit not found",
        ErrorCode.AD_UNIT_NOT_FOUND
      );
    }

    return prisma.advertisement.create({
      data: {
        campaignId: data.campaignId,
        adUnitId: data.adUnitId,
        title: data.title,
        imageUrl: data.imageUrl || null,
        imageUrlMobile: data.imageUrlMobile || null,
        linkUrl: data.linkUrl || null,
        adSenseSnippet: data.adSenseSnippet || null,
        active: data.active,
      },
      include: {
        adUnit: {
          select: { placementId: true, name: true, type: true },
        },
      },
    });
  }

  async updateAdvertisement(id: string, data: UpdateAdInput) {
    const existing = await prisma.advertisement.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(
        "Advertisement not found",
        ErrorCode.AD_NOT_FOUND
      );
    }

    return prisma.advertisement.update({
      where: { id },
      data,
      include: {
        adUnit: {
          select: { placementId: true, name: true, type: true },
        },
      },
    });
  }

  // ─── Ad Units ───────────────────────────────────────────────

  async getAdUnits() {
    const units = await prisma.adUnit.findMany({
      include: {
        _count: {
          select: { advertisements: { where: { active: true } } },
        },
      },
      orderBy: { placementId: "asc" },
    });

    return units.map((unit) => ({
      ...unit,
      activeAdsCount: unit._count.advertisements,
    }));
  }

  // ─── Analytics Overview ─────────────────────────────────────

  async getAnalyticsOverview() {
    const [
      totalImpressions,
      totalClicks,
      activeCampaigns,
      totalBudget,
      totalSpent,
    ] = await Promise.all([
      prisma.adAnalytics.count({ where: { eventType: "IMPRESSION" } }),
      prisma.adAnalytics.count({ where: { eventType: "CLICK" } }),
      prisma.adCampaign.count({ where: { status: "ACTIVE" } }),
      prisma.adCampaign.aggregate({
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
        _sum: { budget: true },
      }),
      prisma.adCampaign.aggregate({
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
        _sum: { spent: true },
      }),
    ]);

    const ctr =
      totalImpressions > 0
        ? Math.round((totalClicks / totalImpressions) * 10000) / 100
        : 0;

    return {
      totalImpressions,
      totalClicks,
      ctr,
      activeCampaigns,
      totalBudget: Number(totalBudget._sum.budget || 0),
      totalSpent: Number(totalSpent._sum.spent || 0),
    };
  }

  // ─── Sponsored Listings ─────────────────────────────────────

  async getSponsoredListingsForSearch(context?: TargetingContext) {
    const now = new Date();

    const sponsoredListings = await prisma.sponsoredListing.findMany({
      where: {
        active: true,
        campaign: {
          status: "ACTIVE",
          startDate: { lte: now },
          endDate: { gte: now },
        },
        listing: {
          status: "ACTIVE",
          deletedAt: null,
        },
      },
      include: {
        listing: {
          include: {
            images: {
              orderBy: { order: "asc" },
              take: 1,
            },
            user: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        campaign: {
          select: { targeting: true, priority: true },
        },
      },
      orderBy: { boostMultiplier: "desc" },
    });

    // Apply targeting filter
    return sponsoredListings.filter((sl) => {
      const targeting = sl.campaign.targeting as TargetingJson | null;
      if (!targeting || Object.keys(targeting).length === 0) return true;

      if (
        context?.fuelType &&
        targeting.fuelType?.length &&
        !targeting.fuelType.includes(context.fuelType)
      )
        return false;
      if (
        context?.bodyType &&
        targeting.bodyType?.length &&
        !targeting.bodyType.includes(context.bodyType)
      )
        return false;

      return true;
    });
  }
}
