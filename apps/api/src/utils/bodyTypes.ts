/**
 * Hierarchical body type parsing utilities
 * Supports format: "category1:subtype1,subtype2|category2:subtype1" or "category1,category2"
 *
 * NOTE: The database stores body types in "category:subtype" format (e.g. "passengerCar:sedan").
 * When filtering by category only, we must expand to all "category:subtype" combinations.
 */

export interface BodyTypeSelection {
	category: string;
	subtypes: string[];
}

/**
 * Known subtypes per category — must stay in sync with the frontend body-types.ts hierarchy.
 * The DB stores values as "category:subtype" strings.
 */
const BODY_TYPE_SUBTYPES: Record<string, string[]> = {
	passengerCar: ["sedan", "hatchback", "touring", "minivan", "coupe", "cabriolet", "pickup", "limousine"],
	suv: ["touring", "pickup", "open", "coupe"],
	commercialVehicle: ["smallCommercial", "commercial", "rigid"],
	truck: ["saddle", "rigid", "chassis"],
	mototechnics: ["classicalMotorcycle", "scooter", "moped", "bike", "cruiserChopper", "touring", "motocross", "enduroAdventure", "trial", "threeWheeler", "atvUtv", "buggy", "mopedCar", "snowmobile", "other"],
	waterVehicle: ["motorboat", "yachtSailboat", "waterscooter", "other"],
	trailer: ["lightTrailer", "semiTrailer", "trailer", "boatTrailer"],
	caravan: ["caravan", "trailerTent"],
	constructionMachinery: ["crane", "concreteMixer", "excavator", "bulldozer", "forklift", "loader", "loaderExcavator", "roadConstruction", "other"],
	agriculturalMachinery: ["tractor", "combine", "mower", "other"],
	forestMachinery: ["harvester", "forwarder", "other"],
	communalMachinery: ["sweepingMachine", "garbageTruck", "excrementsRemoval", "other"],
};

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
export function getBodyTypeValues(selections: BodyTypeSelection[]): string[] {
	const values: string[] = [];

	for (const sel of selections) {
		// Always include the bare category name (matches legacy/direct-category rows)
		values.push(sel.category);

		if (sel.subtypes.length === 0) {
			// No specific subtypes → expand to all known subtypes for this category
			const knownSubtypes = BODY_TYPE_SUBTYPES[sel.category] ?? [];
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
		// Match on specific subtype
		if (sel.subtypes.includes(bodyTypeValue)) return true;
	}
	return false;
}
