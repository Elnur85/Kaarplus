"use client";

import { useEffect, useState, useCallback } from "react";
import { useFilterStore } from "@/store/use-filter-store";
import { BodyTypeFilter } from "./body-type-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useVehicleTaxonomy } from "@/hooks/use-vehicle-taxonomy";

interface FilterSidebarProps {
	onShowResults?: () => void;
	isMobile?: boolean;
}

// Debounce hook for input fields
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// Collapsible section component
function FilterSection({
	title,
	children,
	defaultOpen = false,
}: {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
			>
				<Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer">
					{title}
				</Label>
				{isOpen ? (
					<ChevronDown size={14} className="text-slate-400" />
				) : (
					<ChevronRight size={14} className="text-slate-400" />
				)}
			</button>
			{isOpen && <div className="p-3 space-y-3">{children}</div>}
		</div>
	);
}

export function FilterSidebar({ onShowResults, isMobile }: FilterSidebarProps) {
	const { t } = useTranslation(["listings", "common", "sell", "home"]);
	const filters = useFilterStore();

	// Local state for input fields (before debounce)
	const [localPriceMin, setLocalPriceMin] = useState(filters.priceMin);
	const [localPriceMax, setLocalPriceMax] = useState(filters.priceMax);
	const [localMileageMin, setLocalMileageMin] = useState(filters.mileageMin);
	const [localMileageMax, setLocalMileageMax] = useState(filters.mileageMax);

	// Debounced values
	const debouncedPriceMin = useDebounce(localPriceMin, 500);
	const debouncedPriceMax = useDebounce(localPriceMax, 500);
	const debouncedMileageMin = useDebounce(localMileageMin, 500);
	const debouncedMileageMax = useDebounce(localMileageMax, 500);

	// Sync debounced values to store
	useEffect(() => {
		if (debouncedPriceMin !== filters.priceMin) {
			filters.setFilter("priceMin", debouncedPriceMin);
		}
	}, [debouncedPriceMin, filters]);

	useEffect(() => {
		if (debouncedPriceMax !== filters.priceMax) {
			filters.setFilter("priceMax", debouncedPriceMax);
		}
	}, [debouncedPriceMax, filters]);

	useEffect(() => {
		if (debouncedMileageMin !== filters.mileageMin) {
			filters.setFilter("mileageMin", debouncedMileageMin);
		}
	}, [debouncedMileageMin, filters]);

	useEffect(() => {
		if (debouncedMileageMax !== filters.mileageMax) {
			filters.setFilter("mileageMax", debouncedMileageMax);
		}
	}, [debouncedMileageMax, filters]);

	// Sync local state when filters change from URL or reset
	useEffect(() => {
		setLocalPriceMin(filters.priceMin);
		setLocalPriceMax(filters.priceMax);
		setLocalMileageMin(filters.mileageMin);
		setLocalMileageMax(filters.mileageMax);
	}, [filters.priceMin, filters.priceMax, filters.mileageMin, filters.mileageMax]);

	const currentMake = filters.make;
	const {
		taxonomy,
		models,
		isLoading,
		isLoadingModels,
		error,
		modelError,
		retry,
	} = useVehicleTaxonomy({
		scope: "active",
		make: currentMake,
	});

	useEffect(() => {
		if (!currentMake || currentMake === "none") {
			if (filters.model) {
				filters.setFilter("model", "");
			}
			return;
		}

		if (!isLoadingModels && filters.model && !models.includes(filters.model)) {
			filters.setFilter("model", "");
		}
	}, [currentMake, filters, isLoadingModels, models]);

	// Year range validation - swaps values if range is invalid
	const handleYearMinChange = useCallback(
		(val: string) => {
			const yearValue = val === "any" ? "" : val;
			const yearNum = yearValue ? parseInt(yearValue) : null;
			const currentMax = filters.yearMax ? parseInt(filters.yearMax) : null;

			if (yearNum && currentMax && yearNum > currentMax) {
				filters.setFilter("yearMax", yearValue);
				filters.setFilter("yearMin", filters.yearMax);
			} else {
				filters.setFilter("yearMin", yearValue);
			}
		},
		[filters]
	);

	const handleYearMaxChange = useCallback(
		(val: string) => {
			const yearValue = val === "any" ? "" : val;
			const yearNum = yearValue ? parseInt(yearValue) : null;
			const currentMin = filters.yearMin ? parseInt(filters.yearMin) : null;

			if (yearNum && currentMin && yearNum < currentMin) {
				filters.setFilter("yearMin", yearValue);
				filters.setFilter("yearMax", filters.yearMin);
			} else {
				filters.setFilter("yearMax", yearValue);
			}
		},
		[filters]
	);

	const currentYear = Math.max(taxonomy.years.max, taxonomy.years.min);
	const minYear = Math.min(taxonomy.years.min, taxonomy.years.max);
	const yearOptions = Array.from(
		{ length: Math.max(currentYear - minYear + 1, 1) },
		(_, i) => currentYear - i
	);

	const handleShowResults = () => {
		if (onShowResults) {
			onShowResults();
		}
		if (!isMobile) {
			const resultsGrid = document.getElementById("listings-results");
			if (resultsGrid) {
				resultsGrid.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}
	};

	const handleReset = () => {
		filters.resetFilters();
		setLocalPriceMin("");
		setLocalPriceMax("");
		setLocalMileageMin("");
		setLocalMileageMax("");
	};

	return (
		<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-fit max-h-[calc(100vh-8rem)] flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
				<h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
					<SlidersHorizontal size={16} className="text-primary" />{" "}
					{t("filters.title")}
				</h2>
				<Button
					variant="ghost"
					className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto"
					onClick={handleReset}
				>
					<RotateCcw size={12} className="mr-1" /> {t("filters.clear")}
				</Button>
			</div>

			{/* Scrollable content with better scroll behavior */}
			<div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
				{(error || modelError) && (
					<div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
						<div className="flex items-center justify-between gap-3">
							<span>{t("filters.metadataError")}</span>
							<Button variant="ghost" size="sm" onClick={retry} className="h-auto p-0 text-xs text-destructive hover:text-destructive">
								{t("common:errorBoundary.retry")}
							</Button>
						</div>
					</div>
				)}

				{/* Body Type - Always visible at top, most important */}
				<FilterSection
					title={t("filters.bodyType")}
					defaultOpen={true}
				>
					<BodyTypeFilter
						hierarchy={taxonomy.bodyTypeHierarchy}
						isLoading={isLoading}
					/>
				</FilterSection>

				{/* Make & Model */}
				<FilterSection title={t("filters.make") + " & " + t("filters.model")}>
					<div className="space-y-2">
						<Select
							value={filters.make || "none"}
							onValueChange={(val) =>
								filters.setFilter("make", val === "none" ? "" : val)
							}
							disabled={isLoading}
						>
							<SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm h-9">
								<SelectValue
									placeholder={
										isLoading
												? t("common:common.loading")
												: t("filters.allMakes")
									}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">{t("filters.allMakes")}</SelectItem>
								{taxonomy.makes.map((make) => (
									<SelectItem key={make} value={make}>
										{make}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={filters.model || "none"}
							onValueChange={(val) =>
								filters.setFilter("model", val === "none" ? "" : val)
							}
							disabled={!filters.make || isLoadingModels}
						>
							<SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm h-9">
								<SelectValue
									placeholder={
										isLoadingModels
											? t("common:common.loading")
											: t("filters.allModels")
									}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">{t("filters.allModels")}</SelectItem>
								{models.map((model) => (
									<SelectItem key={model} value={model}>
										{model}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</FilterSection>

				{/* Price Range */}
				<FilterSection title={`${t("filters.price")} (€)`}>
					<div className="flex gap-2">
						<Input
							type="text"
							inputMode="numeric"
							placeholder={t("filters.min")}
							value={localPriceMin}
							onChange={(e) =>
								setLocalPriceMin(e.target.value.replace(/[^0-9]/g, ""))
							}
							className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg h-9"
						/>
						<Input
							type="text"
							inputMode="numeric"
							placeholder={t("filters.max")}
							value={localPriceMax}
							onChange={(e) =>
								setLocalPriceMax(e.target.value.replace(/[^0-9]/g, ""))
							}
							className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg h-9"
						/>
					</div>
				</FilterSection>

				{/* Year Range */}
				<FilterSection title={t("filters.year")}>
					<div className="flex gap-2">
						<Select
							value={filters.yearMin || "any"}
							onValueChange={handleYearMinChange}
						>
							<SelectTrigger className="h-9">
								<SelectValue placeholder={t("filters.from")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">{t("filters.any")}</SelectItem>
								{yearOptions.map((y) => (
									<SelectItem key={y} value={y.toString()}>
										{y}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={filters.yearMax || "any"}
							onValueChange={handleYearMaxChange}
						>
							<SelectTrigger className="h-9">
								<SelectValue placeholder={t("filters.to")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">{t("filters.any")}</SelectItem>
								{yearOptions.map((y) => (
									<SelectItem key={y} value={y.toString()}>
										{y}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</FilterSection>

				{/* Fuel Type */}
				<FilterSection title={t("filters.fuelType")}>
					<div className="grid grid-cols-2 gap-2">
						{taxonomy.fuelTypes.map((fuel) => (
							<div key={fuel} className="flex items-center gap-2">
								<Checkbox
									id={`fuel-${fuel}`}
									checked={filters.fuelType.includes(fuel)}
									onCheckedChange={() =>
										filters.toggleFuelType(fuel)
									}
								/>
								<Label
									htmlFor={`fuel-${fuel}`}
									className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
								>
									{t(`sell:options.fuel.${fuel}`, { defaultValue: fuel })}
								</Label>
							</div>
						))}
					</div>
				</FilterSection>

				{/* Transmission */}
				<FilterSection title={t("filters.transmission")}>
					<Select
						value={filters.transmission}
						onValueChange={(val) =>
							filters.setFilter("transmission", val)
						}
					>
						<SelectTrigger className="h-9">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								{t("common:common.all")}
							</SelectItem>
							{taxonomy.transmissions.map((transmission) => (
								<SelectItem key={transmission} value={transmission}>
									{t(`sell:options.transmission.${transmission}`, {
										defaultValue: transmission,
									})}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FilterSection>

				{/* More Filters - Collapsible group */}
				<FilterSection title={t("filters.moreFilters")}>
					<div className="space-y-4">
						{/* Mileage */}
						<div className="space-y-2">
							<Label className="text-xs text-slate-500">
								{t("filters.mileage")} (km)
							</Label>
							<div className="flex gap-2">
								<Input
									type="text"
									inputMode="numeric"
									placeholder={t("filters.min")}
									value={localMileageMin}
									onChange={(e) =>
										setLocalMileageMin(
											e.target.value.replace(/[^0-9]/g, "")
										)
									}
									className="text-sm h-9"
								/>
								<Input
									type="text"
									inputMode="numeric"
									placeholder={t("filters.max")}
									value={localMileageMax}
									onChange={(e) =>
										setLocalMileageMax(
											e.target.value.replace(/[^0-9]/g, "")
										)
									}
									className="text-sm h-9"
								/>
							</div>
						</div>

						<Separator />

						{/* Drive Type */}
						<div className="space-y-2">
							<Label className="text-xs text-slate-500">
								{t("sell:step2.labels.driveType")}
							</Label>
							<Select
								value={filters.driveType || "none"}
								onValueChange={(val) =>
									filters.setFilter(
										"driveType",
										val === "none" ? "" : val
									)
								}
							>
								<SelectTrigger className="h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">
										{t("common:common.all")}
									</SelectItem>
									{taxonomy.driveTypes.map((driveType) => (
										<SelectItem key={driveType} value={driveType}>
											{t(`sell:options.drive.${driveType}`, {
												defaultValue: driveType,
											})}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Separator />

						{/* Additional Options */}
						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="sidebar-credit"
									checked={filters.credit}
									onCheckedChange={(c) => filters.setFilter('credit', !!c)}
								/>
								<Label htmlFor="sidebar-credit" className="text-xs text-slate-500 cursor-pointer">{t('home:search.credit', { defaultValue: 'Leasing/Credit possible' })}</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="sidebar-barter"
									checked={filters.barter}
									onCheckedChange={(c) => filters.setFilter('barter', !!c)}
								/>
								<Label htmlFor="sidebar-barter" className="text-xs text-slate-500 cursor-pointer">{t('home:search.barter', { defaultValue: 'Barter possible' })}</Label>
							</div>
						</div>

						<Separator />

						{/* Condition */}
						<div className="space-y-2">
							<Label className="text-xs text-slate-500">
								{t("sell:step2.labels.condition")}
							</Label>
							<div className="flex gap-2">
								{["New", "Used"].map((cond) => (
									<Button
										key={cond}
										variant={
											filters.condition === cond
												? "default"
												: "outline"
										}
										className="flex-1 h-9 text-xs"
										onClick={() =>
											filters.setFilter(
												"condition",
												filters.condition === cond
													? ""
													: cond
											)
										}
									>
										{cond === "New"
											? t("sell:options.condition.New")
											: t("sell:options.condition.Used")}
									</Button>
								))}
							</div>
						</div>
					</div>
				</FilterSection>
			</div>

			{/* Footer button */}
			<div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-800/50">
				<Button
					className="w-full bg-primary text-white py-2.5 rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-105 transition-all text-sm"
					onClick={handleShowResults}
				>
					{t("filters.showResults")}
				</Button>
			</div>
		</div>
	);
}
