"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useFilterStore } from "@/store/use-filter-store";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { useTranslation } from "react-i18next";

// Define filter options interface based on API response
interface FilterOptions {
	makes: string[];
	fuelTypes: string[];
	bodyTypes: string[];
	transmissions: string[];
	years: {
		min: number;
		max: number;
	};
	price: {
		min: number;
		max: number;
	};
}

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

export function FilterSidebar({ onShowResults, isMobile }: FilterSidebarProps) {
	const { t } = useTranslation(['listings', 'common', 'sell']);
	const filters = useFilterStore();
	const [makes, setMakes] = useState<string[]>([]);
	const [models, setModels] = useState<string[]>([]);
	const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
	const [isLoadingMakes, setIsLoadingMakes] = useState(true);
	const [isLoadingModels, setIsLoadingModels] = useState(false);
	const [isLoadingOptions, setIsLoadingOptions] = useState(true);

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
	}, [debouncedPriceMin]);

	useEffect(() => {
		if (debouncedPriceMax !== filters.priceMax) {
			filters.setFilter("priceMax", debouncedPriceMax);
		}
	}, [debouncedPriceMax]);

	useEffect(() => {
		if (debouncedMileageMin !== filters.mileageMin) {
			filters.setFilter("mileageMin", debouncedMileageMin);
		}
	}, [debouncedMileageMin]);

	useEffect(() => {
		if (debouncedMileageMax !== filters.mileageMax) {
			filters.setFilter("mileageMax", debouncedMileageMax);
		}
	}, [debouncedMileageMax]);

	// Sync local state when filters change from URL or reset
	useEffect(() => {
		setLocalPriceMin(filters.priceMin);
		setLocalPriceMax(filters.priceMax);
		setLocalMileageMin(filters.mileageMin);
		setLocalMileageMax(filters.mileageMax);
	}, [filters.priceMin, filters.priceMax, filters.mileageMin, filters.mileageMax]);

	const currentMake = filters.make;

	// Fetch makes and filter options on mount
	useEffect(() => {
		let cancelled = false;

		Promise.all([
			fetch(`${API_URL}/search/makes`).then(r => r.json()),
			fetch(`${API_URL}/search/filters`).then(r => r.json()),
		])
			.then(([makesData, filtersData]) => {
				if (!cancelled) {
					setMakes(makesData.data || []);
					setFilterOptions(filtersData.data);
				}
			})
			.catch(console.error)
			.finally(() => {
				if (!cancelled) {
					setIsLoadingMakes(false);
					setIsLoadingOptions(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, []);

	// Fetch models when make changes
	useEffect(() => {
		if (!currentMake || currentMake === "none") {
			setModels([]);
			// Clear model filter when make is cleared
			if (filters.model) {
				filters.setFilter("model", "");
			}
			return;
		}

		let cancelled = false;
		setIsLoadingModels(true);

		fetch(`${API_URL}/search/models?make=${encodeURIComponent(currentMake)}`)
			.then((res) => res.json())
			.then((json) => {
				if (!cancelled) {
					const fetchedModels = json.data || [];
					setModels(fetchedModels);

					// If current model is not in the new models list, clear it
					// Only clear if we actually got models back (safety against fetch errors or race conditions)
					if (filters.model && fetchedModels.length > 0 && !fetchedModels.includes(filters.model)) {
						filters.setFilter("model", "");
					}
				}
			})
			.catch(console.error)
			.finally(() => {
				if (!cancelled) {
					setIsLoadingModels(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [currentMake]);

	// Year range validation - swaps values if range is invalid
	const handleYearMinChange = useCallback((val: string) => {
		const yearValue = val === "any" ? "" : val;
		const yearNum = yearValue ? parseInt(yearValue) : null;
		const currentMax = filters.yearMax ? parseInt(filters.yearMax) : null;

		// If setting yearMin and it's greater than yearMax, swap the values
		if (yearNum && currentMax && yearNum > currentMax) {
			filters.setFilter("yearMax", yearValue);
			filters.setFilter("yearMin", filters.yearMax);
		} else {
			filters.setFilter("yearMin", yearValue);
		}
	}, [filters.yearMax]);

	const handleYearMaxChange = useCallback((val: string) => {
		const yearValue = val === "any" ? "" : val;
		const yearNum = yearValue ? parseInt(yearValue) : null;
		const currentMin = filters.yearMin ? parseInt(filters.yearMin) : null;

		// If setting yearMax and it's less than yearMin, swap the values
		if (yearNum && currentMin && yearNum < currentMin) {
			filters.setFilter("yearMin", yearValue);
			filters.setFilter("yearMax", filters.yearMin);
		} else {
			filters.setFilter("yearMax", yearValue);
		}
	}, [filters.yearMin]);

	// Handle price input changes (local state only, debounce handles store update)
	const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, '');
		setLocalPriceMin(value);
	};

	const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, '');
		setLocalPriceMax(value);
	};

	const handleMileageMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, '');
		setLocalMileageMin(value);
	};

	const handleMileageMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, '');
		setLocalMileageMax(value);
	};

	// Generate year options from filter options or fallback
	const currentYear = new Date().getFullYear();
	const minYear = filterOptions?.years?.min || 1990;
	const yearOptions = Array.from(
		{ length: currentYear - minYear + 1 },
		(_, i) => currentYear - i
	);

	// Get dynamic fuel types and body types from API
	const fuelTypes = filterOptions?.fuelTypes || [];
	const bodyTypes = filterOptions?.bodyTypes || [];

	// Transmission options from API or fallback
	const transmissionOptions = filterOptions?.transmissions || ["Manual", "Automatic"];

	const handleShowResults = () => {
		if (onShowResults) {
			onShowResults();
		}
		// Scroll to results grid on desktop
		if (!isMobile) {
			const resultsGrid = document.getElementById('listings-results');
			if (resultsGrid) {
				resultsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
		<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-fit">
			<div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
				<h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
					<SlidersHorizontal size={18} className="text-primary" /> {t('filters.title')}
				</h2>
				<Button
					variant="ghost"
					size="sm"
					className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto"
					onClick={handleReset}
				>
					<RotateCcw size={12} className="mr-1" /> {t('filters.clear')}
				</Button>
			</div>

			<div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
				{/* Make & Model */}
				<div className="space-y-3">
					<Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
						{t('filters.make')} & {t('filters.model')}
					</Label>
					<Select
						value={filters.make || "none"}
						onValueChange={(val) => filters.setFilter("make", val === "none" ? "" : val)}
						disabled={isLoadingMakes}
					>
						<SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm">
							<SelectValue placeholder={isLoadingMakes ? t('common.loading') : t('filters.allMakes')} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">{t('filters.allMakes')}</SelectItem>
							{makes.map((make) => (
								<SelectItem key={make} value={make}>{make}</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={filters.model || "none"}
						onValueChange={(val) => filters.setFilter("model", val === "none" ? "" : val)}
						disabled={!filters.make || isLoadingModels}
					>
						<SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm">
							<SelectValue placeholder={isLoadingModels ? t('common.loading') : t('filters.allModels')} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">{t('filters.allModels')}</SelectItem>
							{models.map((model) => (
								<SelectItem key={model} value={model}>{model}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Separator />

				{/* Price Range */}
				<div className="space-y-4">
					<Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('filters.price')} (€)</Label>
					<div className="flex gap-2">
						<Input
							type="text"
							inputMode="numeric"
							placeholder={t('filters.min')}
							value={localPriceMin}
							onChange={handlePriceMinChange}
							className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg"
						/>
						<Input
							type="text"
							inputMode="numeric"
							placeholder={t('filters.max')}
							value={localPriceMax}
							onChange={handlePriceMaxChange}
							className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg"
						/>
					</div>
				</div>

				<Separator />

				{/* Year Range */}
				<div className="space-y-4">
					<Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('filters.year')}</Label>
					<div className="flex gap-2">
						<Select
							value={filters.yearMin || "any"}
							onValueChange={handleYearMinChange}
						>
							<SelectTrigger>
								<SelectValue placeholder={t('filters.from')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">{t('filters.any')}</SelectItem>
								{yearOptions.map((y) => (
									<SelectItem key={y} value={y.toString()}>{y}</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={filters.yearMax || "any"}
							onValueChange={handleYearMaxChange}
						>
							<SelectTrigger>
								<SelectValue placeholder={t('filters.to')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">{t('filters.any')}</SelectItem>
								{yearOptions.map((y) => (
									<SelectItem key={y} value={y.toString()}>{y}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<Separator />

				{/* Mileage Range */}
				<div className="space-y-4">
					<Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('filters.mileage')} (km)</Label>
					<div className="flex gap-2">
						<Input
							type="text"
							inputMode="numeric"
							placeholder={t('filters.min')}
							value={localMileageMin}
							onChange={handleMileageMinChange}
							className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg"
						/>
						<Input
							type="text"
							inputMode="numeric"
							placeholder={t('filters.max')}
							value={localMileageMax}
							onChange={handleMileageMaxChange}
							className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg"
						/>
					</div>
				</div>

				<Separator />

				{/* Fuel Type */}
				<div className="space-y-3">
					<Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('filters.fuelType')}</Label>
					{isLoadingOptions ? (
						<div className="text-sm text-slate-500">{t('common.loading', { defaultValue: 'Loading...' })}</div>
					) : (
						<div className="space-y-2">
							{fuelTypes.map((fuel) => (
								<div key={fuel} className="flex items-center space-x-2">
									<Checkbox
										id={`fuel-${fuel}`}
										checked={filters.fuelType.includes(fuel)}
										onCheckedChange={() => filters.toggleFuelType(fuel)}
									/>
									<label
										htmlFor={`fuel-${fuel}`}
										className="text-sm text-slate-700 dark:text-slate-300 leading-none cursor-pointer hover:text-primary transition-colors"
									>
										{t(`sell:options.fuel.${fuel}`, { defaultValue: fuel })}
									</label>
								</div>
							))}
						</div>
					)}
				</div>

				<Separator />

				{/* Transmission */}
				<div className="space-y-3">
					<Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('filters.transmission')}</Label>
					<RadioGroup value={filters.transmission} onValueChange={(val) => filters.setFilter("transmission", val)}>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="all" id="t-all" />
							<Label htmlFor="t-all" className="text-sm font-normal">{t('common.all', { ns: 'common' })}</Label>
						</div>
						{transmissionOptions.map((trans) => (
							<div key={trans} className="flex items-center space-x-2">
								<RadioGroupItem value={trans.toLowerCase()} id={`t-${trans}`} />
								<Label htmlFor={`t-${trans}`} className="text-sm font-normal">
									{t(`sell:options.transmission.${trans}`, { defaultValue: trans })}
								</Label>
							</div>
						))}
					</RadioGroup>
				</div>

				<Separator />

				{/* Body Type */}
				<div className="space-y-3">
					<Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('filters.bodyType')}</Label>
					{isLoadingOptions ? (
						<div className="text-sm text-slate-500">{t('common.loading', { defaultValue: 'Loading...' })}</div>
					) : (
						<div className="grid grid-cols-1 gap-2">
							{bodyTypes.map((body) => (
								<div key={body} className="flex items-center space-x-2">
									<Checkbox
										id={`body-${body}`}
										checked={filters.bodyType.includes(body)}
										onCheckedChange={() => filters.toggleBodyType(body)}
									/>
									<label
										htmlFor={`body-${body}`}
										className="text-sm text-slate-700 dark:text-slate-300 leading-none cursor-pointer hover:text-primary transition-colors"
									>
										{t(`sell:step1.types.${body.toLowerCase()}`, { defaultValue: body })}
									</label>
								</div>
							))}
						</div>
					)}
				</div>

				<Separator />

				{/* Drive Type */}
				<div className="space-y-3">
					<Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sell:step2.labels.driveType')}</Label>
					<Select
						value={filters.driveType || "none"}
						onValueChange={(val) => filters.setFilter("driveType", val === "none" ? "" : val)}
					>
						<SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm">
							<SelectValue placeholder={t('common.all', { ns: 'common' })} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">{t('common.all', { ns: 'common' })}</SelectItem>
							<SelectItem value="FWD">{t('sell:options.drive.Esivedu')}</SelectItem>
							<SelectItem value="RWD">{t('sell:options.drive.Tagavedu')}</SelectItem>
							<SelectItem value="AWD">{t('sell:options.drive.Nelivedu (AWD)')}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Separator />

				{/* Condition */}
				<div className="space-y-3">
					<Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sell:step2.labels.condition')}</Label>
					<div className="grid grid-cols-2 gap-2">
						{["New", "Used"].map((cond) => (
							<Button
								key={cond}
								variant={filters.condition === cond ? "default" : "outline"}
								size="sm"
								className="h-8 text-xs"
								onClick={() => filters.setFilter("condition", filters.condition === cond ? "" : cond)}
							>
								{cond === "New" ? t('sell:options.condition.Uus') : t('sell:options.condition.Kasutatud')}
							</Button>
						))}
					</div>
				</div>
			</div>

			<div className="p-5 bg-slate-50 dark:bg-slate-800/50">
				<Button
					className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-105 transition-all"
					onClick={handleShowResults}
				>
					{t('filters.showResults')}
				</Button>
			</div>
		</div>
	);
}
