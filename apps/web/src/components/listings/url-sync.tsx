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
        pathname,
        router
    ]);

    return null;
}
