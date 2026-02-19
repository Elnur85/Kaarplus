"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useFilterStore, FilterState } from "@/store/use-filter-store";

export function UrlSync() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const filters = useFilterStore();
	const isInitialMount = useRef(true);

	// Sync URL -> Store on mount (intentionally runs once)
	useEffect(() => {
		if (isInitialMount.current) {
			// First reset all filters to ensure we start clean
			filters.resetFilters();

			const params = Object.fromEntries(searchParams.entries());
			const updates: Partial<FilterState> = {};

			if (params.make) updates.make = params.make;
			if (params.model) updates.model = params.model;
			if (params.priceMin) updates.priceMin = params.priceMin;
			if (params.priceMax) updates.priceMax = params.priceMax;
			if (params.yearMin) updates.yearMin = params.yearMin;
			if (params.yearMax) updates.yearMax = params.yearMax;
			if (params.fuelType) updates.fuelType = params.fuelType.split(",");
			if (params.bodyType) updates.bodyType = params.bodyType.split(",");
			if (params.transmission) updates.transmission = params.transmission;
			if (params.sort) updates.sort = params.sort;
			if (params.view) updates.view = params.view as "grid" | "list";
			if (params.q) updates.q = params.q;
			if (params.mileageMin) updates.mileageMin = params.mileageMin;
			if (params.mileageMax) updates.mileageMax = params.mileageMax;
			if (params.powerMin) updates.powerMin = params.powerMin;
			if (params.powerMax) updates.powerMax = params.powerMax;
			if (params.driveType) updates.driveType = params.driveType;
			if (params.doors) updates.doors = params.doors;
			if (params.seats) updates.seats = params.seats;
			if (params.condition) updates.condition = params.condition;
			if (params.location) updates.location = params.location;
			if (params.color) updates.color = params.color;

			// Apply all updates at once
			filters.setFilters(updates);

			// Page is handled separately as it's not a generic filter update that triggers page reset
			if (params.page) filters.setPage(parseInt(params.page));

			isInitialMount.current = false;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Sync Store -> URL on change
	useEffect(() => {
		if (isInitialMount.current) return;

		const params = new URLSearchParams();

		if (filters.make) params.set("make", filters.make);
		if (filters.model) params.set("model", filters.model);
		if (filters.priceMin) params.set("priceMin", filters.priceMin);
		if (filters.priceMax) params.set("priceMax", filters.priceMax);
		if (filters.yearMin) params.set("yearMin", filters.yearMin);
		if (filters.yearMax) params.set("yearMax", filters.yearMax);
		if (filters.fuelType.length > 0) params.set("fuelType", filters.fuelType.join(","));
		if (filters.bodyType.length > 0) params.set("bodyType", filters.bodyType.join(","));
		if (filters.transmission !== "all") params.set("transmission", filters.transmission);
		if (filters.sort !== "newest") params.set("sort", filters.sort);
		if (filters.view !== "grid") params.set("view", filters.view);
		if (filters.page > 1) params.set("page", filters.page.toString());
		if (filters.q) params.set("q", filters.q);
		if (filters.mileageMin) params.set("mileageMin", filters.mileageMin);
		if (filters.mileageMax) params.set("mileageMax", filters.mileageMax);
		if (filters.powerMin) params.set("powerMin", filters.powerMin);
		if (filters.powerMax) params.set("powerMax", filters.powerMax);
		if (filters.driveType && filters.driveType !== "none") params.set("driveType", filters.driveType);
		if (filters.doors && filters.doors !== "none") params.set("doors", filters.doors);
		if (filters.seats && filters.seats !== "none") params.set("seats", filters.seats);
		if (filters.condition && filters.condition !== "none") params.set("condition", filters.condition);
		if (filters.location && filters.location !== "none") params.set("location", filters.location);
		if (filters.color && filters.color !== "none") params.set("color", filters.color);

		const query = params.toString();
		const url = query ? `${pathname}?${query}` : pathname;

		router.replace(url, { scroll: false });
	}, [
		filters.make,
		filters.model,
		filters.priceMin,
		filters.priceMax,
		filters.yearMin,
		filters.yearMax,
		filters.fuelType,
		filters.bodyType,
		filters.transmission,
		filters.sort,
		filters.view,
		filters.page,
		filters.q,
		filters.mileageMin,
		filters.mileageMax,
		filters.powerMin,
		filters.powerMax,
		filters.driveType,
		filters.doors,
		filters.seats,
		filters.condition,
		filters.location,
		filters.color,
		pathname,
		router
	]);

	return null;
}
