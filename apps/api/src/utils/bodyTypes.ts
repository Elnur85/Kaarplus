import { prisma } from "@kaarplus/database";

import { cacheService } from "./cache";

/**
 * Hierarchical body type parsing utilities
 * Supports format: "category1:subtype1,subtype2|category2:subtype1" or "category1,category2"
 *
 * NOTE: The database stores body types in "category:subtype" format (e.g. "passengerCar:sedan").
 * When filtering by category only, we must expand to all known "category:subtype" combinations.
 */

const CACHE_TTL = 3600;

export type TaxonomyScope = "active" | "all";

export interface BodyTypeSelection {
	category: string;
	subtypes: string[];
}

export interface BodyTypeHierarchyItem {
	category: string;
	subtypes: string[];
}

function getScopeWhere(scope: TaxonomyScope) {
	return scope === "active" ? { status: "ACTIVE" as const } : undefined;
}

export function buildBodyTypeHierarchyFromValues(
	values: Array<string | null | undefined>
): BodyTypeHierarchyItem[] {
	const hierarchy = new Map<string, Set<string>>();

	for (const rawValue of values) {
		if (!rawValue) continue;

		const value = rawValue.trim();
		if (!value) continue;

		const [categoryRaw, subtypeRaw] = value.split(":", 2);
		const category = categoryRaw?.trim();
		const subtype = subtypeRaw?.trim();

		if (!category) continue;

		if (!hierarchy.has(category)) {
			hierarchy.set(category, new Set<string>());
		}

		if (subtype) {
			hierarchy.get(category)?.add(subtype);
		}
	}

	return Array.from(hierarchy.entries())
		.map(([category, subtypes]) => ({
			category,
			subtypes: Array.from(subtypes).sort((a, b) => a.localeCompare(b)),
		}))
		.sort((a, b) => a.category.localeCompare(b.category));
}

export async function getBodyTypeHierarchy(
	scope: TaxonomyScope = "all"
): Promise<BodyTypeHierarchyItem[]> {
	const cacheKey = `search:body-type-hierarchy:${scope}`;
	const cached = cacheService.get<BodyTypeHierarchyItem[]>(cacheKey);
	if (cached) return cached;

	const bodyTypes = await prisma.listing.findMany({
		where: getScopeWhere(scope),
		select: { bodyType: true },
		distinct: ["bodyType"],
		orderBy: { bodyType: "asc" },
	});

	const hierarchy = buildBodyTypeHierarchyFromValues(
		bodyTypes.map((item) => item.bodyType)
	);

	cacheService.set(cacheKey, hierarchy, CACHE_TTL);
	return hierarchy;
}

/**
 * Parse hierarchical body type from query string
 * Format: "passengerCar:sedan,hatchback|suv:touring" or "passengerCar,suv"
 */
export function parseBodyType(value: string): BodyTypeSelection[] {
	if (!value) return [];

	const selections: BodyTypeSelection[] = [];
	const parts = value.split("|");

	for (const part of parts) {
		if (part.includes(":")) {
			// Has subtypes specified
			const [category, subtypesStr] = part.split(":");
			selections.push({
				category: category.trim(),
				subtypes: subtypesStr.split(",").map((s) => s.trim()).filter(Boolean),
			});
		} else {
			// Just category (all subtypes)
			selections.push({
				category: part.trim(),
				subtypes: [],
			});
		}
	}

	return selections;
}

/**
 * Get all body type values for database filtering.
 *
 * The DB stores body types as "category:subtype" (e.g. "passengerCar:sedan").
 * When a category is selected with no specific subtypes, we expand it to all
 * "category:subtype" combinations so the Prisma `in` filter matches correctly.
 */
export function getBodyTypeValues(
	selections: BodyTypeSelection[],
	hierarchy: BodyTypeHierarchyItem[]
): string[] {
	const values: string[] = [];
	const hierarchyMap = new Map(
		hierarchy.map((item) => [item.category, item.subtypes])
	);

	for (const sel of selections) {
		// Always include the bare category name (matches legacy/direct-category rows)
		values.push(sel.category);

		if (sel.subtypes.length === 0) {
			// No specific subtypes → expand to all known subtypes for this category
			const knownSubtypes = hierarchyMap.get(sel.category) ?? [];
			knownSubtypes.forEach((sub) => values.push(`${sel.category}:${sub}`));
		} else {
			// Specific subtypes requested: include "category:subtype" format
			sel.subtypes.forEach((sub) => {
				values.push(`${sel.category}:${sub}`);
				// Also include bare subtype name for backwards compatibility
				values.push(sub);
			});
		}
	}

	return [...new Set(values)];
}

/**
 * Check if the body type value matches the hierarchical selection
 * This allows the database to filter based on category or specific subtype
 */
export function matchesBodyType(
	bodyTypeValue: string,
	selections: BodyTypeSelection[]
): boolean {
	for (const sel of selections) {
		// Direct match on category
		if (sel.category === bodyTypeValue) return true;

		const [category, subtype] = bodyTypeValue.split(":", 2);
		if (sel.category === category) {
			if (sel.subtypes.length === 0) return true;
			if (subtype && sel.subtypes.includes(subtype)) return true;
		}

		// Match on specific subtype stored without a category prefix
		if (sel.subtypes.includes(bodyTypeValue)) return true;
	}
	return false;
}
