import { prisma } from "@kaarplus/database";

import {
	BodyTypeHierarchyItem,
	TaxonomyScope,
	buildBodyTypeHierarchyFromValues,
} from "../utils/bodyTypes";
import { cacheService } from "../utils/cache";

const CACHE_TTL = 3600; // 1 hour for search options

export interface FilterOptions {
	makes: string[];
	fuelTypes: string[];
	bodyTypes: string[];
	transmissions: string[];
	driveTypes: string[];
	colors: string[];
	locations: string[];
	bodyTypeHierarchy: BodyTypeHierarchyItem[];
	years: {
		min: number;
		max: number;
	};
	price: {
		min: number;
		max: number;
	};
}

export function resolveTaxonomyScope(value: unknown): TaxonomyScope {
	return value === "all" ? "all" : "active";
}

export class SearchService {
	private getScopeWhere(scope: TaxonomyScope) {
		return scope === "active" ? { status: "ACTIVE" as const } : undefined;
	}

	async getMakes(scope: TaxonomyScope = "active"): Promise<string[]> {
		const cacheKey = `search:makes:${scope}`;
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

		const makes = await prisma.listing.findMany({
			where: this.getScopeWhere(scope),
			select: { make: true },
			distinct: ["make"],
			orderBy: { make: "asc" },
		});
		const result = makes.map((m) => m.make);
		cacheService.set(cacheKey, result, CACHE_TTL);
		return result;
	}

	async getModels(
		make: string,
		scope: TaxonomyScope = "active"
	): Promise<string[]> {
		const cacheKey = `search:models:${scope}:${make.toLowerCase()}`;
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

		const models = await prisma.listing.findMany({
			where: {
				...this.getScopeWhere(scope),
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

	async getFilterOptions(scope: TaxonomyScope = "active"): Promise<FilterOptions> {
		const cacheKey = `search:filter-options:${scope}`;
		const cached = cacheService.get<FilterOptions>(cacheKey);
		if (cached) return cached;

		const where = this.getScopeWhere(scope);
		const [makes, fuelTypes, bodyTypes, transmissions, driveTypes, colors, locations] = await Promise.all([
			prisma.listing.findMany({
				where,
				select: { make: true },
				distinct: ["make"],
				orderBy: { make: "asc" },
			}),
			prisma.listing.findMany({
				where,
				select: { fuelType: true },
				distinct: ["fuelType"],
				orderBy: { fuelType: "asc" },
			}),
			prisma.listing.findMany({
				where,
				select: { bodyType: true },
				distinct: ["bodyType"],
				orderBy: { bodyType: "asc" },
			}),
			prisma.listing.findMany({
				where,
				select: { transmission: true },
				distinct: ["transmission"],
				orderBy: { transmission: "asc" },
			}),
			prisma.listing.findMany({
				where,
				select: { driveType: true },
				distinct: ["driveType"],
				orderBy: { driveType: "asc" },
			}),
			prisma.listing.findMany({
				where,
				select: { colorExterior: true },
				distinct: ["colorExterior"],
				orderBy: { colorExterior: "asc" },
			}),
			prisma.listing.findMany({
				where,
				select: { location: true },
				distinct: ["location"],
				orderBy: { location: "asc" },
			}),
		]);

		const aggregates = await prisma.listing.aggregate({
			where,
			_min: { year: true, price: true },
			_max: { year: true, price: true },
		});

		const flatBodyTypes = bodyTypes
			.map((item) => item.bodyType)
			.filter((value): value is string => Boolean(value))
			.sort((a, b) => a.localeCompare(b));

		const result: FilterOptions = {
			makes: makes.map((m) => m.make).filter(Boolean).sort(),
			fuelTypes: fuelTypes.map((f) => f.fuelType).filter(Boolean).sort(),
			bodyTypes: flatBodyTypes,
			transmissions: transmissions.map((t) => t.transmission).filter(Boolean).sort(),
			driveTypes: driveTypes
				.map((item) => item.driveType)
				.filter((value): value is string => Boolean(value))
				.sort(),
			colors: colors
				.map((item) => item.colorExterior)
				.filter((value): value is string => Boolean(value))
				.sort(),
			locations: locations
				.map((item) => item.location)
				.filter((value): value is string => Boolean(value))
				.sort(),
			bodyTypeHierarchy: buildBodyTypeHierarchyFromValues(flatBodyTypes),
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

	async getLocations(scope: TaxonomyScope = "active"): Promise<string[]> {
		const cacheKey = `search:locations:${scope}`;
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

		const locations = await prisma.listing.findMany({
			where: this.getScopeWhere(scope),
			select: { location: true },
			distinct: ["location"],
			orderBy: { location: "asc" },
		});
		const result = locations.map((l) => l.location).filter((l): l is string => Boolean(l));
		cacheService.set(cacheKey, result, CACHE_TTL);
		return result;
	}

	async getColors(scope: TaxonomyScope = "active"): Promise<string[]> {
		const cacheKey = `search:colors:${scope}`;
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

		const colors = await prisma.listing.findMany({
			where: this.getScopeWhere(scope),
			select: { colorExterior: true },
			distinct: ["colorExterior"],
			orderBy: { colorExterior: "asc" },
		});
		const result = colors.map((c) => c.colorExterior).filter((c): c is string => Boolean(c));
		cacheService.set(cacheKey, result, CACHE_TTL);
		return result;
	}

	async getDriveTypes(scope: TaxonomyScope = "active"): Promise<string[]> {
		const cacheKey = `search:drive-types:${scope}`;
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

		const driveTypes = await prisma.listing.findMany({
			where: this.getScopeWhere(scope),
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

	async getBodyTypes(scope: TaxonomyScope = "active"): Promise<string[]> {
		const cacheKey = `search:body-types:${scope}`;
		const cached = cacheService.get<string[]>(cacheKey);
		if (cached) return cached;

		const bodyTypes = await prisma.listing.findMany({
			where: this.getScopeWhere(scope),
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
