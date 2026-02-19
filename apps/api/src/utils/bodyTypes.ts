/**
 * Hierarchical body type parsing utilities
 * Supports format: "category1:subtype1,subtype2|category2:subtype1" or "category1,category2"
 */

export interface BodyTypeSelection {
	category: string;
	subtypes: string[];
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
 * Get all body type values for database filtering
 * Returns flattened array of all applicable values
 */
export function getBodyTypeValues(selections: BodyTypeSelection[]): string[] {
	const values: string[] = [];

	for (const sel of selections) {
		values.push(sel.category);
		values.push(...sel.subtypes);
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
