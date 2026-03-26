import {
	prisma,
	VehicleReferenceOptionType,
} from "@kaarplus/database";

import { BodyTypeHierarchyItem } from "../utils/bodyTypes";
import { cacheService } from "../utils/cache";
import { ValidationError } from "../utils/errors";

const CACHE_TTL = 60 * 60 * 12;
const CATALOG_CACHE_KEY = "vehicle-reference:catalog";

export interface SellReferenceOptions {
	makes: string[];
	bodyTypeHierarchy: BodyTypeHierarchyItem[];
	fuelTypes: string[];
	transmissions: string[];
	driveTypes: string[];
	colors: string[];
	locations: string[];
	conditions: string[];
}

interface VehicleReferenceCatalog extends SellReferenceOptions {
	modelsByMake: Record<string, string[]>;
}

interface ListingReferenceValues {
	make: string;
	model: string;
	bodyType: string;
	fuelType: string;
	transmission: string;
	driveType: string;
	colorExterior: string;
	condition: string;
	location: string;
}

export class VehicleReferenceService {
	private async getCatalog(): Promise<VehicleReferenceCatalog> {
		const cached = cacheService.get<VehicleReferenceCatalog>(CATALOG_CACHE_KEY);
		if (cached) {
			return cached;
		}

		const [makes, bodyCategories, options] = await Promise.all([
			prisma.vehicleMake.findMany({
				orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
				include: {
					models: {
						orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
					},
				},
			}),
			prisma.vehicleBodyCategory.findMany({
				orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
				include: {
					subtypes: {
						orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
					},
				},
			}),
			prisma.vehicleReferenceOption.findMany({
				orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { key: "asc" }],
			}),
		]);

		const modelsByMake = Object.fromEntries(
			makes
				.filter((make) => make.models.length > 0)
				.map((make) => [make.name, make.models.map((model) => model.name)])
		);

		const catalog: VehicleReferenceCatalog = {
			makes: Object.keys(modelsByMake),
			modelsByMake,
			bodyTypeHierarchy: bodyCategories.map((category) => ({
				category: category.key,
				subtypes: category.subtypes.map((subtype) => subtype.key),
			})),
			fuelTypes: this.getOptionValues(options, VehicleReferenceOptionType.FUEL_TYPE),
			transmissions: this.getOptionValues(
				options,
				VehicleReferenceOptionType.TRANSMISSION
			),
			driveTypes: this.getOptionValues(
				options,
				VehicleReferenceOptionType.DRIVE_TYPE
			),
			colors: this.getOptionValues(
				options,
				VehicleReferenceOptionType.EXTERIOR_COLOR
			),
			locations: this.getOptionValues(
				options,
				VehicleReferenceOptionType.LOCATION
			),
			conditions: this.getOptionValues(
				options,
				VehicleReferenceOptionType.CONDITION
			),
		};

		cacheService.set(CATALOG_CACHE_KEY, catalog, CACHE_TTL);
		return catalog;
	}

	private getOptionValues(
		options: Array<{ type: VehicleReferenceOptionType; key: string }>,
		type: VehicleReferenceOptionType
	): string[] {
		return options
			.filter((option) => option.type === type)
			.map((option) => option.key);
	}

	private findCanonicalValue(value: string, allowedValues: string[]): string | null {
		const normalizedValue = value.trim().toLowerCase();
		return (
			allowedValues.find(
				(allowedValue) => allowedValue.trim().toLowerCase() === normalizedValue
			) ?? null
		);
	}

	async getSellOptions(): Promise<SellReferenceOptions> {
		const { modelsByMake: _modelsByMake, ...options } = await this.getCatalog();
		return options;
	}

	async getSellModels(make: string): Promise<string[]> {
		if (!make) {
			return [];
		}

		const catalog = await this.getCatalog();
		const canonicalMake = this.findCanonicalValue(make, catalog.makes);

		if (!canonicalMake) {
			return [];
		}

		return catalog.modelsByMake[canonicalMake] ?? [];
	}

	async normalizeListingReferenceValues(
		values: Partial<ListingReferenceValues>
	): Promise<Partial<ListingReferenceValues>> {
		const catalog = await this.getCatalog();
		const details: Array<{ field: keyof ListingReferenceValues; message: string }> =
			[];

		const normalizedValues: Partial<ListingReferenceValues> = {};

		const canonicalMake =
			values.make !== undefined
				? this.findCanonicalValue(values.make, catalog.makes)
				: undefined;
		if (values.make !== undefined && !canonicalMake) {
			details.push({
				field: "make",
				message: "Selected make is not supported",
			});
		}

		if (values.model !== undefined) {
			if (!values.make) {
				details.push({
					field: "make",
					message: "Make is required to validate the selected model",
				});
			} else {
				const modelMake = canonicalMake ?? values.make;
				const canonicalModel = this.findCanonicalValue(
					values.model,
					catalog.modelsByMake[modelMake] ?? []
				);

				if (!canonicalModel) {
					details.push({
						field: "model",
						message: "Selected model is not supported for the chosen make",
					});
				} else {
					normalizedValues.model = canonicalModel;
				}
			}
		}

		if (canonicalMake) {
			normalizedValues.make = canonicalMake;
		}

		if (values.bodyType !== undefined) {
			const canonicalBodyType = this.normalizeBodyType(
				values.bodyType,
				catalog.bodyTypeHierarchy
			);
			if (!canonicalBodyType) {
				details.push({
					field: "bodyType",
					message: "Selected vehicle type is not supported",
				});
			} else {
				normalizedValues.bodyType = canonicalBodyType;
			}
		}

		if (values.fuelType !== undefined) {
			const canonicalFuelType = this.findCanonicalValue(
				values.fuelType,
				catalog.fuelTypes
			);
			if (!canonicalFuelType) {
				details.push({
					field: "fuelType",
					message: "Selected fuel type is not supported",
				});
			} else {
				normalizedValues.fuelType = canonicalFuelType;
			}
		}

		if (values.transmission !== undefined) {
			const canonicalTransmission = this.findCanonicalValue(
				values.transmission,
				catalog.transmissions
			);
			if (!canonicalTransmission) {
				details.push({
					field: "transmission",
					message: "Selected transmission is not supported",
				});
			} else {
				normalizedValues.transmission = canonicalTransmission;
			}
		}

		if (values.driveType !== undefined) {
			const canonicalDriveType = this.findCanonicalValue(
				values.driveType,
				catalog.driveTypes
			);
			if (!canonicalDriveType) {
				details.push({
					field: "driveType",
					message: "Selected drive type is not supported",
				});
			} else {
				normalizedValues.driveType = canonicalDriveType;
			}
		}

		if (values.colorExterior !== undefined) {
			const canonicalColor = this.findCanonicalValue(
				values.colorExterior,
				catalog.colors
			);
			if (!canonicalColor) {
				details.push({
					field: "colorExterior",
					message: "Selected exterior color is not supported",
				});
			} else {
				normalizedValues.colorExterior = canonicalColor;
			}
		}

		if (values.condition !== undefined) {
			const canonicalCondition = this.findCanonicalValue(
				values.condition,
				catalog.conditions
			);
			if (!canonicalCondition) {
				details.push({
					field: "condition",
					message: "Selected condition is not supported",
				});
			} else {
				normalizedValues.condition = canonicalCondition;
			}
		}

		if (values.location !== undefined) {
			const canonicalLocation = this.findCanonicalValue(
				values.location,
				catalog.locations
			);
			if (!canonicalLocation) {
				details.push({
					field: "location",
					message: "Selected location is not supported",
				});
			} else {
				normalizedValues.location = canonicalLocation;
			}
		}

		if (details.length > 0) {
			throw new ValidationError("Listing contains unsupported reference data", details);
		}

		return normalizedValues;
	}

	private normalizeBodyType(
		value: string,
		hierarchy: BodyTypeHierarchyItem[]
	): string | null {
		const normalizedValue = value.trim().toLowerCase();

		for (const item of hierarchy) {
			if (item.category.toLowerCase() === normalizedValue) {
				return item.category;
			}

			for (const subtype of item.subtypes) {
				const storedValue = `${item.category}:${subtype}`;
				if (storedValue.toLowerCase() === normalizedValue) {
					return storedValue;
				}
			}
		}

		return null;
	}
}
