import { describe, it, expect, vi, beforeEach } from "vitest";

import { NotFoundError, BadRequestError } from "../utils/errors";

// Mock must be before importing the service
vi.mock("@kaarplus/database", () => ({
  prisma: {
    adUnit: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    advertisement: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    adCampaign: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    adAnalytics: {
      create: vi.fn(),
      count: vi.fn(),
    },
    sponsoredListing: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

import { AdService } from "./adService";

import { prisma } from "@kaarplus/database";

describe("AdService", () => {
  let service: AdService;

  beforeEach(() => {
    service = new AdService();
    vi.clearAllMocks();
  });

  // ─── Priority Engine ────────────────────────────────────────

  describe("getAdForPlacement", () => {
    it("should return null when ad unit not found", async () => {
      vi.mocked(prisma.adUnit.findUnique).mockResolvedValue(null);

      const result = await service.getAdForPlacement("NONEXISTENT");
      expect(result).toBeNull();
    });

    it("should return null when no active ads exist", async () => {
      vi.mocked(prisma.adUnit.findUnique).mockResolvedValue({
        id: "unit1",
        placementId: "HOME_BILLBOARD",
        active: true,
      } as never);
      vi.mocked(prisma.advertisement.findMany).mockResolvedValue([]);

      const result = await service.getAdForPlacement("HOME_BILLBOARD");
      expect(result).toBeNull();
    });

    it("should return highest-priority active ad", async () => {
      vi.mocked(prisma.adUnit.findUnique).mockResolvedValue({
        id: "unit1",
        placementId: "HOME_BILLBOARD",
        active: true,
      } as never);
      vi.mocked(prisma.advertisement.findMany).mockResolvedValue([
        {
          id: "ad1",
          title: "Takeover Ad",
          imageUrl: "https://img.com/takeover.jpg",
          imageUrlMobile: null,
          linkUrl: "https://partner.com",
          adSenseSnippet: null,
          campaign: {
            id: "c1",
            priority: 1,
            targeting: {},
            budget: 5000,
            spent: 100,
            dailyBudget: 200,
          },
          adUnit: {
            placementId: "HOME_BILLBOARD",
            width: 1200,
            height: 300,
            type: "BANNER",
          },
        },
        {
          id: "ad2",
          title: "House Ad",
          imageUrl: "https://img.com/house.jpg",
          imageUrlMobile: null,
          linkUrl: "https://kaarplus.ee/sell",
          adSenseSnippet: null,
          campaign: {
            id: "c2",
            priority: 2,
            targeting: {},
            budget: 0,
            spent: 0,
            dailyBudget: 0,
          },
          adUnit: {
            placementId: "HOME_BILLBOARD",
            width: 1200,
            height: 300,
            type: "BANNER",
          },
        },
      ] as never);

      const result = await service.getAdForPlacement("HOME_BILLBOARD");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("ad1"); // Priority 1 wins
      expect(result!.title).toBe("Takeover Ad");
    });

    it("should filter by targeting context", async () => {
      vi.mocked(prisma.adUnit.findUnique).mockResolvedValue({
        id: "unit1",
        placementId: "DETAIL_FINANCE",
        active: true,
      } as never);
      vi.mocked(prisma.advertisement.findMany).mockResolvedValue([
        {
          id: "ad1",
          title: "BMW Finance",
          imageUrl: "https://img.com/bmw.jpg",
          imageUrlMobile: null,
          linkUrl: "https://lhv.ee",
          adSenseSnippet: null,
          campaign: {
            id: "c1",
            priority: 1,
            targeting: { make: ["BMW", "Audi"] },
            budget: 5000,
            spent: 0,
            dailyBudget: 200,
          },
          adUnit: { placementId: "DETAIL_FINANCE", width: 300, height: 250, type: "BANNER" },
        },
      ] as never);

      // Match: BMW is in targeting
      const result1 = await service.getAdForPlacement("DETAIL_FINANCE", { make: "BMW" });
      expect(result1).not.toBeNull();

      // No match: Toyota is not in targeting
      const result2 = await service.getAdForPlacement("DETAIL_FINANCE", { make: "Toyota" });
      expect(result2).toBeNull();
    });

    it("should exclude over-budget campaigns", async () => {
      vi.mocked(prisma.adUnit.findUnique).mockResolvedValue({
        id: "unit1",
        placementId: "HOME_BILLBOARD",
        active: true,
      } as never);
      vi.mocked(prisma.advertisement.findMany).mockResolvedValue([
        {
          id: "ad1",
          title: "Over Budget",
          imageUrl: null,
          imageUrlMobile: null,
          linkUrl: null,
          adSenseSnippet: null,
          campaign: {
            id: "c1",
            priority: 1,
            targeting: {},
            budget: 1000,
            spent: 1001, // Over budget
            dailyBudget: 100,
          },
          adUnit: { placementId: "HOME_BILLBOARD", width: 1200, height: 300, type: "BANNER" },
        },
      ] as never);

      const result = await service.getAdForPlacement("HOME_BILLBOARD");
      expect(result).toBeNull();
    });

    it("should show ads with zero budget (unlimited)", async () => {
      vi.mocked(prisma.adUnit.findUnique).mockResolvedValue({
        id: "unit1",
        placementId: "HOME_BILLBOARD",
        active: true,
      } as never);
      vi.mocked(prisma.advertisement.findMany).mockResolvedValue([
        {
          id: "ad1",
          title: "Unlimited Budget",
          imageUrl: null,
          imageUrlMobile: null,
          linkUrl: null,
          adSenseSnippet: null,
          campaign: {
            id: "c1",
            priority: 2,
            targeting: {},
            budget: 0, // Zero = unlimited
            spent: 5000,
            dailyBudget: 0,
          },
          adUnit: { placementId: "HOME_BILLBOARD", width: 1200, height: 300, type: "BANNER" },
        },
      ] as never);

      const result = await service.getAdForPlacement("HOME_BILLBOARD");
      expect(result).not.toBeNull();
    });
  });

  // ─── Track Event ────────────────────────────────────────────

  describe("trackEvent", () => {
    it("should create analytics record with hashed IP", async () => {
      vi.mocked(prisma.advertisement.findUnique).mockResolvedValue({
        id: "ad1",
      } as never);
      vi.mocked(prisma.adAnalytics.create).mockResolvedValue({} as never);

      await service.trackEvent("ad1", "IMPRESSION", {
        device: "desktop",
        locale: "et",
        ip: "192.168.1.1",
      });

      expect(prisma.adAnalytics.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            advertisementId: "ad1",
            eventType: "IMPRESSION",
            device: "desktop",
            locale: "et",
            ipHash: expect.any(String),
          }),
        })
      );

      // Verify IP was hashed (not stored raw)
      const callArgs = vi.mocked(prisma.adAnalytics.create).mock.calls[0][0];
      expect((callArgs as { data: { ipHash: string } }).data.ipHash).not.toBe("192.168.1.1");
      expect((callArgs as { data: { ipHash: string } }).data.ipHash).toHaveLength(16);
    });

    it("should throw NotFoundError for invalid ad ID", async () => {
      vi.mocked(prisma.advertisement.findUnique).mockResolvedValue(null);

      await expect(
        service.trackEvent("nonexistent", "CLICK", {})
      ).rejects.toThrow(NotFoundError);
    });

    it("should handle null IP gracefully", async () => {
      vi.mocked(prisma.advertisement.findUnique).mockResolvedValue({
        id: "ad1",
      } as never);
      vi.mocked(prisma.adAnalytics.create).mockResolvedValue({} as never);

      await service.trackEvent("ad1", "CLICK", { device: "mobile" });

      expect(prisma.adAnalytics.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ipHash: null,
          }),
        })
      );
    });
  });

  // ─── Campaign CRUD ──────────────────────────────────────────

  describe("getCampaigns", () => {
    it("should return paginated campaigns with status filter", async () => {
      const mockCampaigns = [
        { id: "c1", name: "Test Campaign", status: "ACTIVE" },
      ];
      vi.mocked(prisma.adCampaign.findMany).mockResolvedValue(mockCampaigns as never);
      vi.mocked(prisma.adCampaign.count).mockResolvedValue(1);

      const result = await service.getCampaigns(1, 20, "ACTIVE");
      expect(result.data).toEqual(mockCampaigns);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe("createCampaign", () => {
    it("should create campaign with valid data", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1" } as never);
      vi.mocked(prisma.adCampaign.create).mockResolvedValue({
        id: "c1",
        name: "Test",
        status: "DRAFT",
      } as never);

      const result = await service.createCampaign({
        name: "Test",
        advertiserId: "u1",
        budget: 5000,
        dailyBudget: 200,
        startDate: "2026-03-01T00:00:00.000Z",
        endDate: "2026-04-01T00:00:00.000Z",
        status: "DRAFT",
        priority: 2,
        targeting: {},
      });

      expect(result.name).toBe("Test");
      expect(prisma.adCampaign.create).toHaveBeenCalled();
    });

    it("should throw NotFoundError if advertiser not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        service.createCampaign({
          name: "Test",
          advertiserId: "nonexistent",
          budget: 5000,
          dailyBudget: 200,
          startDate: "2026-03-01T00:00:00.000Z",
          endDate: "2026-04-01T00:00:00.000Z",
          status: "DRAFT",
          priority: 2,
          targeting: {},
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("archiveCampaign", () => {
    it("should set status to ARCHIVED and deactivate ads", async () => {
      vi.mocked(prisma.adCampaign.findUnique).mockResolvedValue({
        id: "c1",
        status: "ACTIVE",
      } as never);
      vi.mocked(prisma.$transaction).mockResolvedValue([
        { id: "c1", status: "ARCHIVED" },
        { count: 2 },
        { count: 1 },
      ]);

      const result = await service.archiveCampaign("c1");
      expect(result.status).toBe("ARCHIVED");
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("should throw NotFoundError if campaign not found", async () => {
      vi.mocked(prisma.adCampaign.findUnique).mockResolvedValue(null);

      await expect(service.archiveCampaign("nonexistent")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  // ─── Update Campaign ───────────────────────────────────────

  describe("updateCampaign", () => {
    it("should update campaign with valid data", async () => {
      vi.mocked(prisma.adCampaign.findUnique).mockResolvedValue({
        id: "c1",
        status: "ACTIVE",
      } as never);
      vi.mocked(prisma.adCampaign.update).mockResolvedValue({
        id: "c1",
        name: "Updated",
      } as never);

      const result = await service.updateCampaign("c1", { name: "Updated" });
      expect(result.name).toBe("Updated");
    });

    it("should throw BadRequestError when updating archived campaign", async () => {
      vi.mocked(prisma.adCampaign.findUnique).mockResolvedValue({
        id: "c1",
        status: "ARCHIVED",
      } as never);

      await expect(
        service.updateCampaign("c1", { name: "Updated" })
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError if campaign not found", async () => {
      vi.mocked(prisma.adCampaign.findUnique).mockResolvedValue(null);

      await expect(
        service.updateCampaign("nonexistent", { name: "Updated" })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── Advertisements ─────────────────────────────────────────

  describe("createAdvertisement", () => {
    it("should create ad when campaign and unit exist", async () => {
      vi.mocked(prisma.adCampaign.findUnique).mockResolvedValue({ id: "c1" } as never);
      vi.mocked(prisma.adUnit.findUnique).mockResolvedValue({ id: "u1" } as never);
      vi.mocked(prisma.advertisement.create).mockResolvedValue({
        id: "ad1",
        title: "Test Ad",
      } as never);

      const result = await service.createAdvertisement({
        campaignId: "c1",
        adUnitId: "u1",
        title: "Test Ad",
        active: true,
      });

      expect(result.title).toBe("Test Ad");
    });

    it("should throw NotFoundError if campaign not found", async () => {
      vi.mocked(prisma.adCampaign.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.adUnit.findUnique).mockResolvedValue({ id: "u1" } as never);

      await expect(
        service.createAdvertisement({
          campaignId: "nonexistent",
          adUnitId: "u1",
          title: "Test",
          active: true,
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if ad unit not found", async () => {
      vi.mocked(prisma.adCampaign.findUnique).mockResolvedValue({ id: "c1" } as never);
      vi.mocked(prisma.adUnit.findUnique).mockResolvedValue(null);

      await expect(
        service.createAdvertisement({
          campaignId: "c1",
          adUnitId: "nonexistent",
          title: "Test",
          active: true,
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── Analytics Overview ─────────────────────────────────────

  describe("getAnalyticsOverview", () => {
    it("should return aggregate stats", async () => {
      vi.mocked(prisma.adAnalytics.count)
        .mockResolvedValueOnce(1000) // impressions
        .mockResolvedValueOnce(50); // clicks
      vi.mocked(prisma.adCampaign.count).mockResolvedValue(3);
      vi.mocked(prisma.adCampaign.aggregate)
        .mockResolvedValueOnce({ _sum: { budget: 15000 } } as never)
        .mockResolvedValueOnce({ _sum: { spent: 3000 } } as never);

      const result = await service.getAnalyticsOverview();
      expect(result.totalImpressions).toBe(1000);
      expect(result.totalClicks).toBe(50);
      expect(result.ctr).toBe(5);
      expect(result.activeCampaigns).toBe(3);
      expect(result.totalBudget).toBe(15000);
      expect(result.totalSpent).toBe(3000);
    });

    it("should handle zero impressions without division error", async () => {
      vi.mocked(prisma.adAnalytics.count)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      vi.mocked(prisma.adCampaign.count).mockResolvedValue(0);
      vi.mocked(prisma.adCampaign.aggregate)
        .mockResolvedValueOnce({ _sum: { budget: null } } as never)
        .mockResolvedValueOnce({ _sum: { spent: null } } as never);

      const result = await service.getAnalyticsOverview();
      expect(result.ctr).toBe(0);
      expect(result.totalBudget).toBe(0);
      expect(result.totalSpent).toBe(0);
    });
  });

  // ─── Ad Units ───────────────────────────────────────────────

  describe("getAdUnits", () => {
    it("should return ad units with occupancy count", async () => {
      vi.mocked(prisma.adUnit.findMany).mockResolvedValue([
        {
          id: "u1",
          name: "Homepage Billboard",
          placementId: "HOME_BILLBOARD",
          type: "BANNER",
          width: 1200,
          height: 300,
          active: true,
          _count: { advertisements: 2 },
        },
      ] as never);

      const result = await service.getAdUnits();
      expect(result).toHaveLength(1);
      expect(result[0].activeAdsCount).toBe(2);
    });
  });
});
