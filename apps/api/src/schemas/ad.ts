import { z } from "zod";

export const adQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"])
    .optional(),
});

export const createCampaignSchema = z
  .object({
    name: z.string().min(1).max(200),
    advertiserId: z.string().min(1),
    budget: z.number().positive(),
    dailyBudget: z.number().positive(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED"]).default("DRAFT"),
    priority: z.number().int().min(1).max(3).default(3),
    targeting: z
      .object({
        fuelType: z.array(z.string()).optional(),
        bodyType: z.array(z.string()).optional(),
        make: z.array(z.string()).optional(),
        location: z.array(z.string()).optional(),
      })
      .default({}),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  budget: z.number().positive().optional(),
  dailyBudget: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"]).optional(),
  priority: z.number().int().min(1).max(3).optional(),
  targeting: z
    .object({
      fuelType: z.array(z.string()).optional(),
      bodyType: z.array(z.string()).optional(),
      make: z.array(z.string()).optional(),
      location: z.array(z.string()).optional(),
    })
    .optional(),
});

export const createAdSchema = z.object({
  campaignId: z.string().min(1),
  adUnitId: z.string().min(1),
  title: z.string().min(1).max(200),
  imageUrl: z.string().url().optional(),
  imageUrlMobile: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  adSenseSnippet: z.string().optional(),
  active: z.boolean().default(true),
});

export const updateAdSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  imageUrl: z.string().url().nullable().optional(),
  imageUrlMobile: z.string().url().nullable().optional(),
  linkUrl: z.string().url().nullable().optional(),
  adSenseSnippet: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export const trackEventSchema = z.object({
  eventType: z.enum(["IMPRESSION", "CLICK"]),
  device: z.string().optional(),
  locale: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CreateAdInput = z.infer<typeof createAdSchema>;
export type UpdateAdInput = z.infer<typeof updateAdSchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
