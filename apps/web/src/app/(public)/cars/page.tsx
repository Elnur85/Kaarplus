"use client";

import { useEffect, useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useFilterStore } from "@/store/use-filter-store";
import { FilterSidebar } from "@/components/listings/filter-sidebar";
import { FilterBadges } from "@/components/listings/filter-badges";
import { SortControls } from "@/components/listings/sort-controls";
import { ViewToggle } from "@/components/listings/view-toggle";
import { ResultsCount } from "@/components/listings/results-count";
import { UrlSync } from "@/components/listings/url-sync";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleSummary } from "@/types/vehicle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Car, AlertCircle } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

function CarsPageContent() {
	const { t } = useTranslation("listings");
	const [listings, setListings] = useState<VehicleSummary[]>([]);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const filters = useFilterStore();

	const fetchListings = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const params = new URLSearchParams();
			if (filters.make && filters.make !== "none") params.set("make", filters.make);
			if (filters.model && filters.model !== "none") params.set("model", filters.model);
			if (filters.priceMin) params.set("priceMin", filters.priceMin);
			if (filters.priceMax) params.set("priceMax", filters.priceMax);
			if (filters.yearMin) params.set("yearMin", filters.yearMin);
			if (filters.yearMax) params.set("yearMax", filters.yearMax);
			if (filters.fuelType.length > 0) params.set("fuelType", filters.fuelType.join(","));
			if (filters.bodyType.length > 0) params.set("bodyType", filters.bodyType.join(","));
			if (filters.transmission !== "all") params.set("transmission", filters.transmission);
			if (filters.sort) params.set("sort", filters.sort);
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
			params.set("page", filters.page.toString());
			params.set("pageSize", "20");

			const response = await fetch(`/api/v1/search?${params.toString()}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch listings: ${response.status}`);
			}

			const json = await response.json();

			setListings(json.data || []);
			setTotal(json.meta?.total || 0);
		} catch (fetchError) {
			console.error("Failed to fetch listings:", fetchError);
			setError(t("carsPage.error"));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchListings();
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
		filters.color
	]);

	const breadcrumbJsonLd = generateBreadcrumbJsonLd([
		{ name: t("carsPage.breadcrumb.home"), item: SITE_URL },
		{ name: t("carsPage.breadcrumb.cars"), item: `${SITE_URL}/cars` },
	]);

	return (
		<div className="container py-8 min-h-screen">
			<JsonLd data={breadcrumbJsonLd} />
			<Suspense fallback={null}>
				<UrlSync />
			</Suspense>

			{/* Page Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<Car className="h-8 w-8 text-primary" />
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
						{t("carsPage.title")}
					</h1>
				</div>
				<p className="text-muted-foreground">
					{t("carsPage.description")}
				</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-8">
				{/* Sidebar - Desktop */}
				<aside className="hidden lg:block w-[300px] shrink-0 sticky top-24 h-fit">
					<FilterSidebar />
				</aside>

				{/* Main Content */}
				<main className="flex-1 min-w-0">
					<div className="flex flex-col gap-6">
						{/* Header & Controls */}
						<div className="space-y-4">
							<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
								<ResultsCount count={listings.length} total={total} isLoading={isLoading} />

								<div className="flex items-center gap-3">
									{/* Mobile Filter Trigger */}
									<Sheet>
										<SheetTrigger asChild>
											<Button variant="outline" size="sm" className="lg:hidden h-9 px-3 gap-2">
												<SlidersHorizontal size={16} />
												{t("carsPage.filters")}
											</Button>
										</SheetTrigger>
										<SheetContent side="left" className="p-0 w-[300px]">
											<div className="h-full overflow-hidden">
												<FilterSidebar />
											</div>
										</SheetContent>
									</Sheet>

									<ViewToggle />
									<SortControls />
								</div>
							</div>

							<FilterBadges />
						</div>

						{/* Error State */}
						{error && !isLoading && (
							<div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
								<AlertCircle className="size-5 text-red-500 shrink-0" />
								<p className="text-sm text-red-700">{error}</p>
								<Button
									variant="outline"
									size="sm"
									className="ml-auto shrink-0"
									onClick={() => fetchListings()}
								>
									{t("carsPage.retry")}
								</Button>
							</div>
						)}

						{/* Results Grid/List */}
						{isLoading ? (
							<div className={`grid gap-6 ${filters.view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
								{Array.from({ length: 9 }).map((_, i) => (
									<ListingSkeleton key={i} variant={filters.view} />
								))}
							</div>
						) : listings.length > 0 ? (
							<div className={`grid gap-6 ${filters.view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
								{listings.map((vehicle) => (
									<VehicleCard key={vehicle.id} vehicle={vehicle} variant={filters.view} />
								))}
							</div>
						) : !error ? (
							<div className="py-20 text-center border rounded-xl bg-card border-dashed">
								<Car className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
								<h3 className="text-lg font-semibold">{t("carsPage.noResults")}</h3>
								<p className="text-muted-foreground mt-1">{t("carsPage.noResultsDesc")}</p>
								<Button variant="outline" className="mt-4" onClick={filters.resetFilters}>
									{t("carsPage.clearAllFilters")}
								</Button>
							</div>
						) : null}

						{/* Pagination */}
						{!isLoading && total > 20 && (
							<div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border pt-8">
								<p className="text-sm text-muted-foreground">
									{t("carsPage.showing", {
										start: ((filters.page - 1) * 20) + 1,
										end: Math.min(filters.page * 20, total),
										total: total || 0,
									})}
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

function ListingSkeleton({ variant }: { variant: "grid" | "list" }) {
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

// Export the page component
export default function CarsPage() {
	return <CarsPageContent />;
}
