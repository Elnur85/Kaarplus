"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/constants";
import { useTranslation } from "react-i18next";

interface SearchStats {
	todayCount: number;
	totalCount: number;
}

export function HomeSearch() {
	const { t } = useTranslation(['home', 'sell']);
	const router = useRouter();

	// State
	const [activeTab, setActiveTab] = useState("all"); // all, new, used
	const [makes, setMakes] = useState<string[]>([]);
	const [models, setModels] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]); // Assuming we have city data or hardcode major ones
	const [bodyTypes, setBodyTypes] = useState<string[]>([]);

	// Selection State
	const [selectedMake, setSelectedMake] = useState("");
	const [selectedModel, setSelectedModel] = useState("");
	const [selectedBodyType, setSelectedBodyType] = useState("");
	const [selectedCity, setSelectedCity] = useState(""); // Optional if we don't have city data yet
	const [priceMin, setPriceMin] = useState("");
	const [priceMax, setPriceMax] = useState("");
	const [yearMin, setYearMin] = useState("");
	const [yearMax, setYearMax] = useState("");


	// Toggles
	const [isCredit, setIsCredit] = useState(false);
	const [isBarter, setIsBarter] = useState(false);

	// Loading states
	const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
	const [isLoadingModels, setIsLoadingModels] = useState(false);

	// Stats (fetched from API)
	const [stats, setStats] = useState<SearchStats>({ todayCount: 0, totalCount: 0 });
	const [foundCount, setFoundCount] = useState<number | null>(null);

	// Initial Data Fetch
	useEffect(() => {
		const safeFetch = async (url: string) => {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		};

		const fetchData = async () => {
			try {
				const [makesJson, filtersJson, locationsJson, statsJson] = await Promise.all([
					safeFetch(`${API_URL}/search/makes`),
					safeFetch(`${API_URL}/search/filters`),
					safeFetch(`${API_URL}/search/locations`),
					safeFetch(`${API_URL}/search/stats`)
				]);

				setMakes(makesJson.data || []);
				// API returns "category:subtype" DB strings — extract unique top-level category keys
				const rawBodyTypes: string[] = filtersJson.data?.bodyTypes || [];
				const uniqueCategories = Array.from(
					new Set(rawBodyTypes.map((bt: string) => bt.split(":")[0]).filter(Boolean))
				);
				setBodyTypes(uniqueCategories);
				setCities(locationsJson.data || []);
				if (statsJson.data) {
					setStats({
						todayCount: statsJson.data.totalListings || 0,
						totalCount: statsJson.data.totalListings || 0,
					});
				}
			} catch {
				// Search metadata fetch failed — dropdowns degrade with empty options
			} finally {
				setIsLoadingMetadata(false);
			}
		};

		fetchData();
	}, []);

	// Fetch models when make changes
	useEffect(() => {
		if (!selectedMake || selectedMake === "all") {
			setModels([]);
			setSelectedModel("");
			return;
		}

		const fetchModels = async () => {
			setIsLoadingModels(true);
			try {
				const res = await fetch(`${API_URL}/search/models?make=${encodeURIComponent(selectedMake)}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = await res.json();
				setModels(json.data || []);
				setSelectedModel(""); // Reset model when make changes
			} catch {
				// Model dropdown will remain empty
			} finally {
				setIsLoadingModels(false);
			}
		};

		fetchModels();
	}, [selectedMake]);

	// Search Handler
	const handleSearch = () => {
		const params = new URLSearchParams();

		if (selectedMake && selectedMake !== "all") params.set("make", selectedMake);
		if (selectedModel && selectedModel !== "all") params.set("model", selectedModel);
		if (selectedBodyType && selectedBodyType !== "all") params.set("bodyType", selectedBodyType);
		if (selectedCity && selectedCity !== "all") params.set("location", selectedCity);
		if (priceMin) params.set("priceMin", priceMin);
		if (priceMax) params.set("priceMax", priceMax);
		if (yearMin) params.set("yearMin", yearMin);
		if (yearMax) params.set("yearMax", yearMax);

		if (activeTab === "new") params.set("condition", "New");
		if (activeTab === "used") params.set("condition", "Used");

		// Note: Credit/Barter filters might not exist in backend yet, handled as needed

		router.push(`/listings?${params.toString()}`);
	};

	const handleReset = () => {
		setSelectedMake("");
		setSelectedModel("");
		setSelectedBodyType("");
		setSelectedCity("");
		setPriceMin("");
		setPriceMax("");
		setYearMin("");
		setYearMax("");
		setIsCredit(false);
		setIsBarter(false);
		setActiveTab("all");
	};

	// Generate Year Options
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 40 }, (_, i) => currentYear - i);

	return (
		<div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
			<div className="container mx-auto px-4 py-8">
				<div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">

					{/* Tabs */}
					<Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
						<TabsList className="bg-slate-100 dark:bg-slate-900">
							<TabsTrigger value="all" className="px-6">{t('search.tabs.all')}</TabsTrigger>
							<TabsTrigger value="new" className="px-6">{t('search.tabs.new')}</TabsTrigger>
							<TabsTrigger value="used" className="px-6">{t('search.tabs.used')}</TabsTrigger>
						</TabsList>
					</Tabs>

					{/* Grid Inputs */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

						{/* Row 1 */}
						<Select value={selectedMake} onValueChange={setSelectedMake} disabled={isLoadingMetadata}>
							<SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
								<SelectValue placeholder={t('search.make')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t('search.allMakes')}</SelectItem>
								{makes.map(make => (
									<SelectItem key={make} value={make}>{make}</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedMake || isLoadingModels}>
							<SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
								<SelectValue placeholder={t('search.model')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t('search.allModels')}</SelectItem>
								{models.map(model => (
									<SelectItem key={model} value={model}>{model}</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={selectedBodyType} onValueChange={setSelectedBodyType} disabled={isLoadingMetadata}>
							<SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
								<SelectValue placeholder={t('search.bodyType')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t('search.allBodyTypes')}</SelectItem>
								{bodyTypes.map(bt => (
									<SelectItem key={bt} value={bt}>
										{t(`sell:step1.categories.${bt}`, { defaultValue: bt })}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={selectedCity} onValueChange={setSelectedCity}>
							<SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
								<SelectValue placeholder={t('search.city')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t('search.allCities')}</SelectItem>
								{cities.map(c => (
									<SelectItem key={c} value={c}>{c}</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Row 2 */}
						<div className="flex gap-2">
							<Input
								type="number"
								placeholder={t('search.priceMin')}
								className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
								value={priceMin}
								onChange={(e) => setPriceMin(e.target.value)}
							/>
							<Input
								type="number"
								placeholder={t('search.priceMax')}
								className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
								value={priceMax}
								onChange={(e) => setPriceMax(e.target.value)}
							/>
						</div>



						<div className="flex gap-2">
							<Select value={yearMin} onValueChange={setYearMin}>
								<SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
									<SelectValue placeholder={t('search.yearMin')} />
								</SelectTrigger>
								<SelectContent>
									{years.map(y => (
										<SelectItem key={`min-${y}`} value={y.toString()}>{y}</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select value={yearMax} onValueChange={setYearMax}>
								<SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
									<SelectValue placeholder={t('search.yearMax')} />
								</SelectTrigger>
								<SelectContent>
									{years.map(y => (
										<SelectItem key={`max-${y}`} value={y.toString()}>{y}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-4 px-2">
							<div className="flex items-center space-x-2">
								<Checkbox id="credit" checked={isCredit} onCheckedChange={(c) => setIsCredit(!!c)} />
								<Label htmlFor="credit" className="text-sm font-medium">{t('search.credit')}</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox id="barter" checked={isBarter} onCheckedChange={(c) => setIsBarter(!!c)} />
								<Label htmlFor="barter" className="text-sm font-medium">{t('search.barter')}</Label>
							</div>
						</div>

					</div>

					{/* Footer Actions */}
					<div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700 gap-4">
						<div className="flex gap-6 text-sm font-medium">
							<span className="text-muted-foreground">{t('search.stats.today', { count: stats.todayCount })}</span>
							<button onClick={handleReset} className="text-primary hover:underline">{t('search.reset')}</button>
							<Link href="/listings" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
								{t('search.moreFilters')}
							</Link>
						</div>

						<Button size="lg" className="w-full md:w-auto px-10 font-bold text-lg h-12" onClick={handleSearch}>
							{t('search.submit')}
						</Button>
					</div>

				</div>
			</div>
		</div>
	);
}
