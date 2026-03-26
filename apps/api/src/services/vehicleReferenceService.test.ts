import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	prisma,
	VehicleReferenceOptionType,
} from "@kaarplus/database";

import { cacheService } from "../utils/cache";
import { ValidationError } from "../utils/errors";

import { VehicleReferenceService } from "./vehicleReferenceService";

describe("VehicleReferenceService", () => {
	let service: VehicleReferenceService;

	beforeEach(() => {
		service = new VehicleReferenceService();
		vi.clearAllMocks();
		cacheService.clear();
	});

	it("returns sell options from reference tables", async () => {
		vi.mocked(prisma.vehicleMake.findMany).mockResolvedValue([
			{
				name: "BMW",
				models: [{ name: "3 Series" }],
			},
			{
				name: "Audi",
				models: [{ name: "A4" }],
			},
		] as any);
		vi.mocked(prisma.vehicleBodyCategory.findMany).mockResolvedValue([
			{
				key: "passengerCar",
				subtypes: [{ key: "sedan" }, { key: "touring" }],
			},
		] as any);
		vi.mocked(prisma.vehicleReferenceOption.findMany).mockResolvedValue([
			{ type: VehicleReferenceOptionType.FUEL_TYPE, key: "Petrol" },
			{ type: VehicleReferenceOptionType.TRANSMISSION, key: "Automatic" },
			{ type: VehicleReferenceOptionType.DRIVE_TYPE, key: "AWD" },
			{ type: VehicleReferenceOptionType.EXTERIOR_COLOR, key: "Black" },
			{ type: VehicleReferenceOptionType.LOCATION, key: "Tallinn" },
			{ type: VehicleReferenceOptionType.CONDITION, key: "Used" },
		] as any);

		const result = await service.getSellOptions();

		expect(result).toEqual({
			makes: ["BMW", "Audi"],
			bodyTypeHierarchy: [
				{ category: "passengerCar", subtypes: ["sedan", "touring"] },
			],
			fuelTypes: ["Petrol"],
			transmissions: ["Automatic"],
			driveTypes: ["AWD"],
			colors: ["Black"],
			locations: ["Tallinn"],
			conditions: ["Used"],
		});
	});

	it("returns models for the selected make from reference tables", async () => {
		vi.mocked(prisma.vehicleMake.findMany).mockResolvedValue([
			{
				name: "BMW",
				models: [{ name: "3 Series" }, { name: "X5" }],
			},
		] as any);
		vi.mocked(prisma.vehicleBodyCategory.findMany).mockResolvedValue([] as any);
		vi.mocked(prisma.vehicleReferenceOption.findMany).mockResolvedValue([] as any);

		const result = await service.getSellModels("bmw");

		expect(result).toEqual(["3 Series", "X5"]);
	});

	it("rejects unsupported listing reference values", async () => {
		vi.mocked(prisma.vehicleMake.findMany).mockResolvedValue([
			{
				name: "BMW",
				models: [{ name: "3 Series" }],
			},
		] as any);
		vi.mocked(prisma.vehicleBodyCategory.findMany).mockResolvedValue([
			{
				key: "passengerCar",
				subtypes: [{ key: "sedan" }],
			},
		] as any);
		vi.mocked(prisma.vehicleReferenceOption.findMany).mockResolvedValue([
			{ type: VehicleReferenceOptionType.FUEL_TYPE, key: "Petrol" },
			{ type: VehicleReferenceOptionType.TRANSMISSION, key: "Automatic" },
			{ type: VehicleReferenceOptionType.DRIVE_TYPE, key: "AWD" },
			{ type: VehicleReferenceOptionType.EXTERIOR_COLOR, key: "Black" },
			{ type: VehicleReferenceOptionType.LOCATION, key: "Tallinn" },
			{ type: VehicleReferenceOptionType.CONDITION, key: "Used" },
		] as any);

		const promise = service.normalizeListingReferenceValues({
			make: "BMW",
			model: "A4",
			bodyType: "passengerCar:sedan",
			fuelType: "Petrol",
			transmission: "Automatic",
			driveType: "AWD",
			colorExterior: "Black",
			condition: "Used",
			location: "Tallinn",
		});

		await expect(promise).rejects.toBeInstanceOf(ValidationError);
		await expect(promise).rejects.toMatchObject({
			details: [
				{
					field: "model",
					message: "Selected model is not supported for the chosen make",
				},
			],
		});
	});
});
