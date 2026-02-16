"use client";

import { useEffect, useState } from "react";
import { useFilterStore } from "@/store/use-filter-store";
import { AdvancedFilters } from "@/components/search/advanced-filters";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { Pagination } from "@/components/shared/pagination";
import { SortControls } from "@/components/listings/sort-controls";
import { ViewToggle } from "@/components/listings/view-toggle";
import { FilterBadges } from "@/components/listings/filter-badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Search, Bookmark } from "lucide-react";
import { VehicleSummary } from "@/types/vehicle";
import { API_URL } from "@/lib/constants";
import { SaveSearchModal } from "@/components/search/save-search-modal";

export default function SearchPage() {
    const [listings, setListings] = useState<VehicleSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const filters = useFilterStore();

    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.make && filters.make !== "none") params.set("make", filters.make);
                if (filters.model && filters.model !== "none") params.set("model", filters.model);
                if (filters.priceMin) params.set("priceMin", filters.priceMin);
                if (filters.priceMax) params.set("priceMax", filters.priceMax);
                if (filters.yearMin && filters.yearMin !== "none") params.set("yearMin", filters.yearMin);
                if (filters.yearMax && filters.yearMax !== "none") params.set("yearMax", filters.yearMax);
                if (filters.fuelType.length > 0) params.set("fuelType", filters.fuelType.join(","));
                if (filters.bodyType.length > 0) params.set("bodyType", filters.bodyType.join(","));
                if (filters.transmission !== "all") params.set("transmission", filters.transmission);
                if (filters.mileageMin) params.set("mileageMin", filters.mileageMin);
                if (filters.mileageMax) params.set("mileageMax", filters.mileageMax);
                if (filters.powerMin) params.set("powerMin", filters.powerMin);
                if (filters.powerMax) params.set("powerMax", filters.powerMax);
                if (filters.driveType && filters.driveType !== "none") params.set("driveType", filters.driveType);
                if (filters.color && filters.color !== "none") params.set("color", filters.color);
                if (filters.doors && filters.doors !== "none") params.set("doors", filters.doors);
                if (filters.seats && filters.seats !== "none") params.set("seats", filters.seats);
                if (filters.condition && filters.condition !== "none") params.set("condition", filters.condition);
                if (filters.location && filters.location !== "none") params.set("location", filters.location);
                if (filters.sort) params.set("sort", filters.sort);
                if (filters.q) params.set("q", filters.q);
                params.set("page", filters.page.toString());
                params.set("pageSize", "20");

                const response = await fetch(`${API_URL}/api/search?${params.toString()}`);
                const json = await response.json();

                setListings(json.data || []);
                setTotal(json.meta?.total || 0);
            } catch (error) {
                console.error("Failed to fetch listings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListings();
    }, [
        filters.make, filters.model, filters.priceMin, filters.priceMax,
        filters.yearMin, filters.yearMax, filters.fuelType, filters.bodyType,
        filters.transmission, filters.sort, filters.page, filters.q,
        filters.mileageMin, filters.mileageMax, filters.powerMin, filters.powerMax,
        filters.driveType, filters.color, filters.doors, filters.seats,
        filters.condition, filters.location,
    ]);

    return (
        <div className="container py-8 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Search size={24} className="text-primary" />
                    Täppisotsing
                </h1>
                <p className="text-muted-foreground mt-1">
                    Leidke oma unistuste auto täpsete filtritega
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters - Desktop */}
                <aside className="hidden lg:block w-[340px] shrink-0 sticky top-24 h-fit">
                    <AdvancedFilters />
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="flex flex-col gap-6">
                        {/* Header Controls */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-muted-foreground">
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-32 inline-block" />
                                    ) : (
                                        <span className="font-medium text-foreground">{total}</span>
                                    )}{" "}
                                    {!isLoading && "tulemust"}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Mobile Filter Trigger */}
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="lg:hidden h-9 px-3 gap-2">
                                            <SlidersHorizontal size={16} />
                                            Filtrid
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="p-0 w-[340px]">
                                        <div className="h-full overflow-hidden">
                                            <AdvancedFilters />
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                <SaveSearchModal
                                    trigger={
                                        <Button variant="outline" size="sm" className="h-9 px-3 gap-2 text-primary border-primary/20 hover:bg-primary/5">
                                            <Bookmark size={16} />
                                            Salvesta
                                        </Button>
                                    }
                                />

                                <ViewToggle />
                                <SortControls />
                            </div>
                        </div>

                        <FilterBadges />

                        {/* Results */}
                        {isLoading ? (
                            <div className={`grid gap-6 ${filters.view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <SearchSkeleton key={i} variant={filters.view} />
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <div className={`grid gap-6 ${filters.view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                                {listings.map((vehicle) => (
                                    <VehicleCard key={vehicle.id} vehicle={vehicle} variant={filters.view} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center border rounded-xl bg-card border-dashed">
                                <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-semibold">Tulemusi ei leitud</h3>
                                <p className="text-muted-foreground mt-1">Proovige muuta filtreid või otsingusõna.</p>
                                <Button variant="outline" className="mt-4" onClick={filters.resetFilters}>
                                    Puhasta kõik filtrid
                                </Button>
                            </div>
                        )}

                        {/* Pagination */}
                        {!isLoading && total > 20 && (
                            <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border pt-8">
                                <p className="text-sm text-muted-foreground">
                                    Näitan {((filters.page - 1) * 20) + 1} kuni {Math.min(filters.page * 20, total)} sõidukit {total}-st
                                </p>
                                <Pagination
                                    currentPage={filters.page}
                                    totalPages={Math.ceil(total / 20)}
                                    onPageChange={filters.setPage}
                                    isLoading={isLoading}
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

function SearchSkeleton({ variant }: { variant: "grid" | "list" }) {
    if (variant === "list") {
        return (
            <div className="flex flex-col md:flex-row border rounded-xl overflow-hidden gap-4 h-[200px] border-border bg-card">
                <Skeleton className="w-full md:w-[280px] h-full" />
                <div className="flex-1 p-4 flex flex-col gap-2">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="mt-auto flex justify-between">
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-8 w-1/4" />
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col border rounded-xl overflow-hidden border-border bg-card h-full">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 flex flex-col gap-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="mt-2 flex justify-between items-center">
                    <Skeleton className="h-7 w-1/3" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>
        </div>
    );
}
