"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import React from "react";
import { useFilterStore } from "@/store/use-filter-store";
import { FilterSidebar } from "@/components/listings/filter-sidebar";
import { FilterBadges } from "@/components/listings/filter-badges";
import { SortControls } from "@/components/listings/sort-controls";
import { ViewToggle } from "@/components/listings/view-toggle";
import { ResultsCount } from "@/components/listings/results-count";
import { UrlSync } from "@/components/listings/url-sync";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { AdSlot } from "@/components/shared/ad-slot";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import type { VehicleSummary } from "@/types/vehicle";
import type { SponsoredListingData } from "@/types/ad";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL, API_URL } from "@/lib/constants";
import { parseApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function ListingsPage() {
	const { t } = useTranslation('listings');
	const [listings, setListings] = useState<VehicleSummary[]>([]);
	const [total, setTotal] = useState(0);
	const filters = useFilterStore();
	const [isLoading, setIsLoading] = useState(true);
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);

	const handlePageChange = (page: number) => {
		window.scrollTo({ top: 0, behavior: "instant" });
		filters.setPage(page);
	};

	useEffect(() => {
		// Abort previous in-flight request before starting a new one
		abortControllerRef.current?.abort();
		const controller = new AbortController();
		abortControllerRef.current = controller;

		const fetchListings = async () => {
			setIsLoading(true);
			try {
				const params = new URLSearchParams();
				if (filters.make && filters.make !== "none") params.set("make", filters.make);
				if (filters.model && filters.model !== "none") params.set("model", filters.model);
				if (filters.priceMin) params.set("priceMin", filters.priceMin);
				if (filters.priceMax) params.set("priceMax", filters.priceMax);
				if (filters.yearMin) params.set("yearMin", filters.yearMin);
				if (filters.yearMax) params.set("yearMax", filters.yearMax);
				if (filters.fuelType.length > 0) params.set("fuelType", filters.fuelType.join(","));
				if (filters.bodyTypeSelections.length > 0) params.set("bodyType", filters.getBodyTypeForApi());
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

				const response = await fetch(`${API_URL}/search?${params.toString()}`, {
					signal: controller.signal,
				});

				if (!response.ok) {
					const message = await parseApiError(response, t('carsPage.error'));
					throw new Error(message);
				}

				const json = await response.json();

				setListings(json.data || []);
				setTotal(json.meta?.total || 0);
			} catch (error) {
				// Ignore abort errors - they're expected when filters change quickly
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}
				console.error("Failed to fetch listings:", error);
				const message = error instanceof Error ? error.message : t('carsPage.error');
				toast.error(message);
			} finally {
				// Only clear loading state if this request wasn't aborted
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
			}
		};

		fetchListings();

		// Cleanup: abort any in-flight request when component unmounts or dependencies change
		return () => {
			controller.abort();
		};
	}, [
		filters.make, filters.model, filters.priceMin, filters.priceMax,
		filters.yearMin, filters.yearMax, filters.fuelType, filters.bodyTypeSelections,
		filters.transmission, filters.sort, filters.page, filters.q,
		filters.mileageMin, filters.mileageMax, filters.powerMin, filters.powerMax,
		filters.driveType, filters.doors, filters.seats, filters.condition,
		filters.location, filters.color,
		t
	]);

	const breadcrumbJsonLd = generateBreadcrumbJsonLd([
		{ name: t('carsPage.breadcrumb.home'), item: SITE_URL },
		{ name: t('carsPage.breadcrumb.cars'), item: `${SITE_URL}/listings` },
	]);

	return (
		<div className="container py-8 min-h-screen">
			<JsonLd data={breadcrumbJsonLd} />
			<Suspense fallback={null}>
				<UrlSync />
			</Suspense>

			<div className="flex flex-col lg:flex-row gap-8">
				{/* Sidebar - Desktop */}
				<aside className="hidden lg:block w-[300px] shrink-0 sticky top-24 h-fit space-y-6">
					<FilterSidebar />
					<AdSlot placementId="SEARCH_SIDEBAR" className="rounded-xl overflow-hidden" />
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
									<Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
										<SheetTrigger asChild>
											<Button variant="outline" size="sm" className="lg:hidden h-9 px-3 gap-2">
												<SlidersHorizontal size={16} />
												{t('filters.title')}
											</Button>
										</SheetTrigger>
										<SheetContent side="left" className="p-0 w-[300px]">
											<SheetTitle className="sr-only">{t('filters.title')}</SheetTitle>
											<div className="h-full overflow-hidden">
												<FilterSidebar
													onShowResults={() => setMobileFiltersOpen(false)}
													isMobile={true}
												/>
											</div>
										</SheetContent>
									</Sheet>

									<ViewToggle />
									<SortControls />
								</div>
							</div>

							<FilterBadges />
						</div>

						{/* Results Grid/List */}
						<div id="listings-results" />
						{isLoading ? (
							<div className={`grid gap-6 ${filters.view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
								{Array.from({ length: 9 }).map((_, i) => (
									<ListingSkeleton key={i} variant={filters.view} />
								))}
							</div>
						) : listings.length > 0 ? (
							<div className={`grid gap-6 ${filters.view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
								{listings.map((vehicle, index) => (
									<React.Fragment key={vehicle.id}>
										<VehicleCard
											vehicle={vehicle}
											variant={filters.view}
											sponsored={vehicle.isSponsored}
										/>
										{/* Inline Display Ad after every 10th result if not already showing one */}
										{(index + 1) % 10 === 0 && (
											<AdSlot
												placementId="LISTINGS_INLINE"
												context={{
													make: filters.make !== "none" ? filters.make : undefined,
													fuelType: filters.fuelType[0],
													bodyType: filters.bodyTypeSelections[0]?.category,
												}}
												className="col-span-full py-4 h-[120px]"
											/>
										)}
									</React.Fragment>
								))}
							</div>
						) : (
							<div className="py-20 text-center border rounded-xl bg-card border-dashed">
								<h3 className="text-lg font-semibold">{t('results.noResults')}</h3>
								<p className="text-muted-foreground mt-1">{t('results.noResultsDesc')}</p>
								<Button variant="outline" className="mt-4" onClick={filters.resetFilters}>
									{t('results.clearAll')}
								</Button>
							</div>
						)}

						{/* Pagination */}
						{!isLoading && total > 20 && (
							<div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border pt-8">
								<p className="text-sm text-muted-foreground">
									{t('results.showing', {
										start: ((filters.page - 1) * 20) + 1,
										end: Math.min(filters.page * 20, total),
										total: total || 0
									})}
								</p>
								<Pagination
									currentPage={filters.page}
									totalPages={Math.ceil(total / 20)}
									onPageChange={handlePageChange}
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
			<div data-testid="listing-skeleton" className="flex flex-col md:flex-row border rounded-xl overflow-hidden gap-4 h-[200px] border-border bg-card">
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
		<div data-testid="listing-skeleton" className="flex flex-col border rounded-xl overflow-hidden border-border bg-card h-full">
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
