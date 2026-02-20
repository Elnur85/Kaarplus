import { prisma } from "@kaarplus/database";

import { cacheService } from "../utils/cache";

const CACHE_TTL = 3600; // 1 hour for search options

// Type definitions for filter options
export interface FilterOptions {
	makes: string[];
	fuelTypes: string[];
	bodyTypes: string[];
	transmissions: string[];
	years: {
		min: number;
		max: number;
	};
	price: {
		min: number;
		max: number;
	};
}

export class SearchService {
	async getMakes(): Promise<string[]> {
		const cacheKey = "search:makes";
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

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
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

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

	async getFilterOptions(): Promise<FilterOptions> {
		const cacheKey = "search:filter-options";
		const cached = cacheService.get<FilterOptions>(cacheKey);
		if (cached) return cached;

		// This could be optimized by querying distinct values for each field
		const [makes, fuelTypes, bodyTypes, transmissions] = await Promise.all([
			prisma.listing.findMany({
				where: { status: "ACTIVE" },
				select: { make: true },
				distinct: ["make"],
			}),
			prisma.listing.findMany({
				where: { status: "ACTIVE" },
				select: { fuelType: true },
				distinct: ["fuelType"],
			}),
			prisma.listing.findMany({
				where: { status: "ACTIVE" },
				select: { bodyType: true },
				distinct: ["bodyType"],
			}),
			prisma.listing.findMany({
				where: { status: "ACTIVE" },
				select: { transmission: true },
				distinct: ["transmission"],
			}),
		]);

		// Query for min/max year and price
		const aggregates = await prisma.listing.aggregate({
			where: { status: "ACTIVE" },
			_min: { year: true, price: true },
			_max: { year: true, price: true },
		});

		const result: FilterOptions = {
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
			},
		};

		cacheService.set(cacheKey, result, CACHE_TTL);
		return result;
	}

	async getLocations(): Promise<string[]> {
		const cacheKey = "search:locations";
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

		const locations = await prisma.listing.findMany({
			where: {
				status: "ACTIVE",
				location: { not: "Baku" }
			},
			select: { location: true },
			distinct: ["location"],
			orderBy: { location: "asc" },
		});
		const result = locations.map((l) => l.location).filter((l): l is string => Boolean(l));
		cacheService.set(cacheKey, result, CACHE_TTL);
		return result;
	}

	async getColors(): Promise<string[]> {
		const cacheKey = "search:colors";
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

		const colors = await prisma.listing.findMany({
			where: { status: "ACTIVE" },
			select: { colorExterior: true },
			distinct: ["colorExterior"],
			orderBy: { colorExterior: "asc" },
		});
		const result = colors.map((c) => c.colorExterior).filter((c): c is string => Boolean(c));
		cacheService.set(cacheKey, result, CACHE_TTL);
		return result;
	}

	async getDriveTypes(): Promise<string[]> {
		const cacheKey = "search:drive-types";
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

		const driveTypes = await prisma.listing.findMany({
			where: { status: "ACTIVE" },
			select: { driveType: true },
			distinct: ["driveType"],
			orderBy: { driveType: "asc" },
		});
		const result = driveTypes
			.map((d) => d.driveType)
			.filter((d): d is string => Boolean(d));
		cacheService.set(cacheKey, result, CACHE_TTL);
		return result;
	}

	async getBodyTypes(): Promise<string[]> {
		const cacheKey = "search:body-types";
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

		const bodyTypes = await prisma.listing.findMany({
			where: { status: "ACTIVE" },
			select: { bodyType: true },
			distinct: ["bodyType"],
			orderBy: { bodyType: "asc" },
		});
		const result = bodyTypes
			.map((b) => b.bodyType)
			.filter((b): b is string => Boolean(b));
		cacheService.set(cacheKey, result, CACHE_TTL);
		return result;
	}

	async getPlatformStats(): Promise<{
		totalListings: number;
		totalMakes: number;
		totalModels: number;
		totalLocations: number;
	}> {
		const cacheKey = "search:platform-stats";
		const cached = cacheService.get<{
			totalListings: number;
			totalMakes: number;
			totalModels: number;
			totalLocations: number;
		}>(cacheKey);
		if (cached) return cached;

		const [
			totalListings,
			makesCount,
			modelsCount,
			locationsCount,
		] = await Promise.all([
			prisma.listing.count({ where: { status: "ACTIVE" } }),
			prisma.listing
				.groupBy({ by: ["make"], where: { status: "ACTIVE" } })
				.then((r) => r.length),
			prisma.listing
				.groupBy({ by: ["model"], where: { status: "ACTIVE" } })
				.then((r) => r.length),
			prisma.listing
				.groupBy({ by: ["location"], where: { status: "ACTIVE" } })
				.then((r) => r.length),
		]);

		const result = {
			totalListings,
			totalMakes: makesCount,
			totalModels: modelsCount,
			totalLocations: locationsCount,
		};

		cacheService.set(cacheKey, result, CACHE_TTL);
		return result;
	}
}
