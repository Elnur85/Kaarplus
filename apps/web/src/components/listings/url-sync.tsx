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
            const params = Object.fromEntries(searchParams.entries());

            if (params.make) filters.setFilter("make", params.make);
            if (params.model) filters.setFilter("model", params.model);
            if (params.priceMin) filters.setFilter("priceMin", params.priceMin);
            if (params.priceMax) filters.setFilter("priceMax", params.priceMax);
            if (params.yearMin) filters.setFilter("yearMin", params.yearMin);
            if (params.yearMax) filters.setFilter("yearMax", params.yearMax);
            if (params.fuelType) filters.setFilter("fuelType", params.fuelType.split(","));
            if (params.bodyType) filters.setFilter("bodyType", params.bodyType.split(","));
            if (params.transmission) filters.setFilter("transmission", params.transmission);
            if (params.sort) filters.setFilter("sort", params.sort);
            if (params.view) filters.setFilter("view", params.view as "grid" | "list");
            if (params.page) filters.setPage(parseInt(params.page));
            if (params.q) filters.setFilter("q", params.q);
            if (params.mileageMin) filters.setFilter("mileageMin", params.mileageMin);
            if (params.mileageMax) filters.setFilter("mileageMax", params.mileageMax);
            if (params.powerMin) filters.setFilter("powerMin", params.powerMin);
            if (params.powerMax) filters.setFilter("powerMax", params.powerMax);
            if (params.driveType) filters.setFilter("driveType", params.driveType);
            if (params.doors) filters.setFilter("doors", params.doors);
            if (params.seats) filters.setFilter("seats", params.seats);
            if (params.condition) filters.setFilter("condition", params.condition);
            if (params.location) filters.setFilter("location", params.location);
            if (params.color) filters.setFilter("color", params.color);

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
