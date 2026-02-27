/**
 * Hierarchical body type structure for vehicle classification
 * Main categories with subtypes as per GROUND_RULES.md
 */

export interface BodyTypeCategory {
	key: string;
	subtypes: string[];
}

export const BODY_TYPE_HIERARCHY: BodyTypeCategory[] = [
	{
		key: "passengerCar",
		subtypes: [
			"sedan",
			"hatchback",
			"touring",
			"minivan",
			"coupe",
			"cabriolet",
			"pickup",
			"limousine",
		],
	},
	{
		key: "suv",
		subtypes: ["touring", "pickup", "open", "coupe"],
	},
	{
		key: "commercialVehicle",
		subtypes: ["smallCommercial", "commercial", "rigid"],
	},
	{
		key: "truck",
		subtypes: ["saddle", "rigid", "chassis"],
	},
	{
		key: "mototechnics",
		subtypes: [
			"classicalMotorcycle",
			"scooter",
			"moped",
			"bike",
			"cruiserChopper",
			"touring",
			"motocross",
			"enduroAdventure",
			"trial",
			"threeWheeler",
			"atvUtv",
			"buggy",
			"mopedCar",
			"snowmobile",
			"other",
		],
	},
	{
		key: "waterVehicle",
		subtypes: ["motorboat", "yachtSailboat", "waterscooter", "other"],
	},
	{
		key: "trailer",
		subtypes: ["lightTrailer", "semiTrailer", "trailer", "boatTrailer"],
	},
	{
		key: "caravan",
		subtypes: ["caravan", "trailerTent"],
	},
	{
		key: "constructionMachinery",
		subtypes: [
			"crane",
			"concreteMixer",
			"excavator",
			"bulldozer",
			"forklift",
			"loader",
			"loaderExcavator",
			"roadConstruction",
			"other",
		],
	},
	{
		key: "agriculturalMachinery",
		subtypes: ["tractor", "combine", "mower", "other"],
	},
	{
		key: "forestMachinery",
		subtypes: ["harvester", "forwarder", "other"],
	},
	{
		key: "communalMachinery",
		subtypes: [
			"sweepingMachine",
			"garbageTruck",
			"excrementsRemoval",
			"other",
		],
	},
];

/**
 * Get all main category keys
 */
export function getMainCategories(): string[] {
	return BODY_TYPE_HIERARCHY.map((cat) => cat.key);
}

/**
 * Get subtypes for a specific category
 */
export function getSubtypes(categoryKey: string): string[] {
	return (
		BODY_TYPE_HIERARCHY.find((cat) => cat.key === categoryKey)?.subtypes || []
	);
}

/**
 * Check if a value is a main category
 */
export function isMainCategory(value: string): boolean {
	return BODY_TYPE_HIERARCHY.some((cat) => cat.key === value);
}

/**
 * Get the parent category for a subtype
 */
export function getParentCategory(subtype: string): string | null {
	for (const cat of BODY_TYPE_HIERARCHY) {
		if (cat.subtypes.includes(subtype)) {
			return cat.key;
		}
	}
	return null;
}

/**
 * Get all possible body type values (categories + subtypes)
 */
export function getAllBodyTypes(): string[] {
	const allTypes: string[] = [];
	for (const cat of BODY_TYPE_HIERARCHY) {
		allTypes.push(cat.key);
		allTypes.push(...cat.subtypes);
	}
	return allTypes;
}

/**
 * Serialize body type selections for URL
 * Format: "category1:subtype1,subtype2|category2:subtype1"
 * Or just categories: "category1,category2"
 */
export function serializeBodyType(selections: BodyTypeSelection[]): string {
	const parts: string[] = [];

	for (const sel of selections) {
		if (sel.subtypes.length === 0) {
			// Only category selected (all subtypes implied)
			parts.push(sel.category);
		} else {
			// Specific subtypes selected
			parts.push(`${sel.category}:${sel.subtypes.join(",")}`);
		}
	}

	return parts.join("|");
}

/**
 * Deserialize body type selections from URL
 */
export function deserializeBodyType(value: string): BodyTypeSelection[] {
	if (!value) return [];

	const selections: BodyTypeSelection[] = [];
	const parts = value.split("|");

	for (const part of parts) {
		if (part.includes(":")) {
			// Has subtypes specified
			const [category, subtypesStr] = part.split(":");
			selections.push({
				category,
				subtypes: subtypesStr.split(",").filter(Boolean),
			});
		} else {
			// Just category (all subtypes)
			selections.push({
				category: part,
				subtypes: [],
			});
		}
	}

	return selections;
}

export interface BodyTypeSelection {
	category: string;
	subtypes: string[];
}

/**
 * Flatten selections to simple array for API filtering
 * Returns all applicable values (categories expand to their subtypes)
 */
export function flattenBodyTypeSelections(
	selections: BodyTypeSelection[]
): string[] {
	const flat: string[] = [];

	for (const sel of selections) {
		if (sel.subtypes.length === 0) {
			// Category selected - include category and all subtypes for filtering
			flat.push(sel.category);
			flat.push(...getSubtypes(sel.category));
		} else {
			// Specific subtypes selected
			flat.push(sel.category);
			flat.push(...sel.subtypes);
		}
	}


	return Array.from(new Set(flat)); // Remove duplicates
}

/**
 * Human-readable Estonian labels for compound body type values (e.g. 'passengerCar:touring')
 */
export const BODY_TYPE_LABELS: Record<string, string> = {
	'passengerCar': 'Sõiduauto',
	'passengerCar:sedan': 'Sedaan',
	'passengerCar:hatchback': 'Luukpära',
	'passengerCar:touring': 'Universaal',
	'passengerCar:minivan': 'Mahtuniversaal',
	'passengerCar:coupe': 'Kupee',
	'passengerCar:cabriolet': 'Kabriolett',
	'passengerCar:pickup': 'Pikap',
	'passengerCar:limousine': 'Limusiinid',
	'suv': 'Linnamaastur',
	'suv:touring': 'Maastur',
	'suv:pickup': 'Maastur-pikap',
	'suv:open': 'Avatud maastur',
	'suv:coupe': 'SUV Kupee',
	'commercialVehicle': 'Kommertssõiduk',
	'commercialVehicle:smallCommercial': 'Väike kommertssõiduk',
	'commercialVehicle:commercial': 'Kaubik',
	'commercialVehicle:rigid': 'Veoauto (jäik)',
	'truck': 'Veoauto',
	'truck:saddle': 'Sadulveoauto',
	'truck:rigid': 'Jäikveoauto',
	'truck:chassis': 'Šassii',
	'mototechnics': 'Mototehnika',
	'mototechnics:classicalMotorcycle': 'Mootorratas',
	'mototechnics:scooter': 'Skuter',
	'mototechnics:moped': 'Moped',
	'mototechnics:bike': 'Jalgratas',
	'mototechnics:cruiserChopper': 'Kruiser/Chopper',
	'mototechnics:touring': 'Turismimootorratas',
	'mototechnics:motocross': 'Motokross',
	'mototechnics:enduroAdventure': 'Enduro/Adventure',
	'mototechnics:trial': 'Trial',
	'mototechnics:threeWheeler': 'Kolmerattaline',
	'mototechnics:atvUtv': 'ATV/UTV',
	'mototechnics:buggy': 'Buggy',
	'mototechnics:mopedCar': 'Mopeedauto',
	'mototechnics:snowmobile': 'Mootorsaan',
	'waterVehicle': 'Veesõiduk',
	'waterVehicle:motorboat': 'Mootorpaat',
	'waterVehicle:yachtSailboat': 'Jaht/Purjekas',
	'waterVehicle:waterscooter': 'Vesiskuter',
	'trailer': 'Haagis',
	'trailer:lightTrailer': 'Kerge haagis',
	'trailer:semiTrailer': 'Poolhaagis',
	'trailer:trailer': 'Haagis',
	'trailer:boatTrailer': 'Paadihaagis',
	'caravan': 'Haagissuvilad',
	'caravan:caravan': 'Suvila',
	'caravan:trailerTent': 'Haagistelk',
};

/**
 * Format a stored body type value (e.g. 'passengerCar:touring') into a readable Estonian label.
 * Falls back gracefully: tries exact match → category only → raw value.
 */
export function formatBodyType(value: string): string {
	if (!value) return value;
	if (BODY_TYPE_LABELS[value]) return BODY_TYPE_LABELS[value];
	// Try just the category part before the colon
	const category = value.split(':')[0];
	if (category && BODY_TYPE_LABELS[category]) return BODY_TYPE_LABELS[category];
	return value;
}
