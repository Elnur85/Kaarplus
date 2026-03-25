import { api } from "./api";

export type TaxonomyScope = "active" | "all";

export interface BodyTypeHierarchyItem {
	category: string;
	subtypes: string[];
}

export interface VehicleTaxonomy {
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

const currentYear = new Date().getFullYear();

export const EMPTY_VEHICLE_TAXONOMY: VehicleTaxonomy = {
	makes: [],
	fuelTypes: [],
	bodyTypes: [],
	transmissions: [],
	driveTypes: [],
	colors: [],
	locations: [],
	bodyTypeHierarchy: [],
	years: {
		min: currentYear,
		max: currentYear,
	},
	price: {
		min: 0,
		max: 0,
	},
};

function normalizeStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];

	return value.filter(
		(item): item is string => typeof item === "string" && item.trim().length > 0
	);
}

function normalizeBodyTypeHierarchy(value: unknown): BodyTypeHierarchyItem[] {
	if (!Array.isArray(value)) return [];

	return value
		.map((item) => {
			if (!item || typeof item !== "object") return null;

			const category =
				"category" in item && typeof item.category === "string"
					? item.category
					: null;
			const subtypes =
				"subtypes" in item ? normalizeStringArray(item.subtypes) : [];

			if (!category) return null;

			return {
				category,
				subtypes,
			};
		})
		.filter((item): item is BodyTypeHierarchyItem => Boolean(item));
}

export async function loadVehicleTaxonomy(
	scope: TaxonomyScope
): Promise<VehicleTaxonomy> {
	const response = await api.get<Partial<VehicleTaxonomy>>("/search/filters", {
		scope,
	});

	const data = response.data ?? {};

	return {
		makes: normalizeStringArray(data.makes),
		fuelTypes: normalizeStringArray(data.fuelTypes),
		bodyTypes: normalizeStringArray(data.bodyTypes),
		transmissions: normalizeStringArray(data.transmissions),
		driveTypes: normalizeStringArray(data.driveTypes),
		colors: normalizeStringArray(data.colors),
		locations: normalizeStringArray(data.locations),
		bodyTypeHierarchy: normalizeBodyTypeHierarchy(data.bodyTypeHierarchy),
		years: {
			min:
				typeof data.years?.min === "number" ? data.years.min : currentYear,
			max:
				typeof data.years?.max === "number" ? data.years.max : currentYear,
		},
		price: {
			min: typeof data.price?.min === "number" ? data.price.min : 0,
			max: typeof data.price?.max === "number" ? data.price.max : 0,
		},
	};
}

export async function loadVehicleModels(
	make: string,
	scope: TaxonomyScope
): Promise<string[]> {
	if (!make) return [];

	const response = await api.get<string[]>("/search/models", { make, scope });
	return normalizeStringArray(response.data);
}
