import { api } from "./api";
import { BodyTypeHierarchyItem } from "./vehicle-taxonomy";

export interface SellReferenceData {
	makes: string[];
	bodyTypeHierarchy: BodyTypeHierarchyItem[];
	fuelTypes: string[];
	transmissions: string[];
	driveTypes: string[];
	colors: string[];
	locations: string[];
	conditions: string[];
}

export const EMPTY_SELL_REFERENCE_DATA: SellReferenceData = {
	makes: [],
	bodyTypeHierarchy: [],
	fuelTypes: [],
	transmissions: [],
	driveTypes: [],
	colors: [],
	locations: [],
	conditions: [],
};

function normalizeStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter(
		(item): item is string => typeof item === "string" && item.trim().length > 0
	);
}

function normalizeBodyTypeHierarchy(value: unknown): BodyTypeHierarchyItem[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.map((item) => {
			if (!item || typeof item !== "object") {
				return null;
			}

			const category =
				"category" in item && typeof item.category === "string"
					? item.category
					: null;
			const subtypes =
				"subtypes" in item ? normalizeStringArray(item.subtypes) : [];

			if (!category) {
				return null;
			}

			return {
				category,
				subtypes,
			};
		})
		.filter((item): item is BodyTypeHierarchyItem => Boolean(item));
}

export async function loadSellReferenceData(): Promise<SellReferenceData> {
	const response = await api.get<Partial<SellReferenceData>>(
		"/listings/metadata/sell-options"
	);
	const data = response.data ?? {};

	return {
		makes: normalizeStringArray(data.makes),
		bodyTypeHierarchy: normalizeBodyTypeHierarchy(data.bodyTypeHierarchy),
		fuelTypes: normalizeStringArray(data.fuelTypes),
		transmissions: normalizeStringArray(data.transmissions),
		driveTypes: normalizeStringArray(data.driveTypes),
		colors: normalizeStringArray(data.colors),
		locations: normalizeStringArray(data.locations),
		conditions: normalizeStringArray(data.conditions),
	};
}

export async function loadSellModels(make: string): Promise<string[]> {
	if (!make) {
		return [];
	}

	const response = await api.get<string[]>("/listings/metadata/sell-models", {
		make,
	});

	return normalizeStringArray(response.data);
}
