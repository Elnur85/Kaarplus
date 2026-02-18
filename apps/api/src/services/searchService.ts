import { prisma } from "@kaarplus/database";

import { cacheService } from "../utils/cache";

const CACHE_TTL = 3600; // 1 hour for search options

export class SearchService {
    async getMakes(): Promise<string[]> {
        const cacheKey = "search:makes";
        const cached = cacheService.get(cacheKey);
        if (cached) return cached as string[];

        const makes = await prisma.listing.findMany({
            where: { status: "ACTIVE" },
            select: { make: true },
            distinct: ["make"],
            orderBy: { make: "asc" },
        });
        const result = makes.map((m) => m.make);
        cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }

    async getModels(make: string): Promise<string[]> {
        const cacheKey = `search:models:${make.toLowerCase()}`;
        const cached = cacheService.get(cacheKey);
        if (cached) return cached as string[];

        const models = await prisma.listing.findMany({
            where: {
                status: "ACTIVE",
                make: { equals: make, mode: "insensitive" },
            },
            select: { model: true },
            distinct: ["model"],
            orderBy: { model: "asc" },
        });
        const result = models.map((m) => m.model);
        cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }

    async getFilterOptions(): Promise<any> {
        const cacheKey = "search:filter-options";
        const cached = cacheService.get(cacheKey);
        if (cached) return cached as any;

        // This could be optimized by querying distinct values for each field
        const [makes, fuelTypes, bodyTypes, transmissions] = await Promise.all([
            prisma.listing.findMany({ where: { status: "ACTIVE" }, select: { make: true }, distinct: ["make"] }),
            prisma.listing.findMany({ where: { status: "ACTIVE" }, select: { fuelType: true }, distinct: ["fuelType"] }),
            prisma.listing.findMany({ where: { status: "ACTIVE" }, select: { bodyType: true }, distinct: ["bodyType"] }),
            prisma.listing.findMany({ where: { status: "ACTIVE" }, select: { transmission: true }, distinct: ["transmission"] }),
        ]);

        // Query for min/max year and price
        const aggregates = await prisma.listing.aggregate({
            where: { status: "ACTIVE" },
            _min: { year: true, price: true },
            _max: { year: true, price: true },
        });

        const result = {
            makes: makes.map((m) => m.make).filter(Boolean).sort(),
            fuelTypes: fuelTypes.map((f) => f.fuelType).filter(Boolean).sort(),
            bodyTypes: bodyTypes.map((b) => b.bodyType).filter(Boolean).sort(),
            transmissions: transmissions.map((t) => t.transmission).filter(Boolean).sort(),
            years: {
                min: aggregates._min.year || 1990,
                max: aggregates._max.year || new Date().getFullYear(),
            },
            price: {
                min: Number(aggregates._min.price) || 0,
                max: Number(aggregates._max.price) || 500000,
            }
        };

        cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }

    async getLocations(): Promise<string[]> {
        const cacheKey = "search:locations";
        const cached = cacheService.get(cacheKey);
        if (cached) return cached as string[];

        const locations = await prisma.listing.findMany({
            where: { status: "ACTIVE" },
            select: { location: true },
            distinct: ["location"],
            orderBy: { location: "asc" },
        });
        const result = locations.map((l) => l.location).filter(Boolean) as string[];
        cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }

    async getColors(): Promise<string[]> {
        const cacheKey = "search:colors";
        const cached = cacheService.get(cacheKey);
        if (cached) return cached as string[];

        const colors = await prisma.listing.findMany({
            where: { status: "ACTIVE" },
            select: { colorExterior: true },
            distinct: ["colorExterior"],
            orderBy: { colorExterior: "asc" },
        });
        const result = colors.map((c) => c.colorExterior).filter(Boolean) as string[];
        cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }

    async getDriveTypes(): Promise<string[]> {
        const cacheKey = "search:drive-types";
        const cached = cacheService.get(cacheKey);
        if (cached) return cached as string[];

        const driveTypes = await prisma.listing.findMany({
            where: { status: "ACTIVE" },
            select: { driveType: true },
            distinct: ["driveType"],
            orderBy: { driveType: "asc" },
        });
        const result = driveTypes.map((d) => d.driveType).filter(Boolean) as string[];
        cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }

    async getBodyTypes(): Promise<string[]> {
        const cacheKey = "search:body-types";
        const cached = cacheService.get(cacheKey);
        if (cached) return cached as string[];

        const bodyTypes = await prisma.listing.findMany({
            where: { status: "ACTIVE" },
            select: { bodyType: true },
            distinct: ["bodyType"],
            orderBy: { bodyType: "asc" },
        });
        const result = bodyTypes.map((b) => b.bodyType).filter(Boolean) as string[];
        cacheService.set(cacheKey, result, CACHE_TTL);
        return result;
    }
}
