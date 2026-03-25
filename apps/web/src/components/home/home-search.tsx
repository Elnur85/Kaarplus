"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useVehicleTaxonomy } from "@/hooks/use-vehicle-taxonomy";

interface SearchStats {
	todayCount: number;
	totalCount: number;
}

export function HomeSearch() {
	const { t } = useTranslation(['home', 'sell', 'common']);
	const router = useRouter();

	// State
	const [activeTab, setActiveTab] = useState("all"); // all, new, used

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

	// Stats (fetched from API)
	const [stats, setStats] = useState<SearchStats>({ todayCount: 0, totalCount: 0 });
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
		make: selectedMake,
	});

	// Stats fetch
	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch(`${API_URL}/search/stats`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const statsJson = await res.json();
				if (statsJson.data) {
					setStats({
						todayCount: statsJson.data.totalListings || 0,
						totalCount: statsJson.data.totalListings || 0,
					});
				}
			} catch (err) {
				console.error("Home search stats fetch failed:", err);
			}
		};

		fetchStats();
	}, []);

	useEffect(() => {
		if (!selectedMake || selectedMake === "all") {
			setSelectedModel("");
			return;
		}

		if (!isLoadingModels && selectedModel && !models.includes(selectedModel)) {
			setSelectedModel("");
		}
	}, [isLoadingModels, selectedMake, selectedModel, models]);

	useEffect(() => {
		if (error || modelError) {
			toast.error(t('search.metadataError'));
		}
	}, [error, modelError, t]);

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
	const currentYear = Math.max(taxonomy.years.max, taxonomy.years.min);
	const minYear = Math.min(taxonomy.years.min, taxonomy.years.max);
	const years = Array.from(
		{ length: Math.max(currentYear - minYear + 1, 1) },
		(_, i) => currentYear - i
	);

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
						<Select value={selectedMake || "all"} onValueChange={setSelectedMake} disabled={isLoading}>
							<SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
								<SelectValue placeholder={t('search.make')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t('search.allMakes')}</SelectItem>
								{taxonomy.makes.map(make => (
									<SelectItem key={make} value={make}>{make}</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={selectedModel || "all"} onValueChange={setSelectedModel} disabled={!selectedMake || selectedMake === "all" || isLoadingModels}>
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

						<Select value={selectedBodyType || "all"} onValueChange={setSelectedBodyType} disabled={isLoading}>
							<SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
								<SelectValue placeholder={t('search.bodyType')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t('search.allBodyTypes')}</SelectItem>
								{taxonomy.bodyTypeHierarchy.map((item) => (
									<SelectItem key={item.category} value={item.category}>
										{t(`sell:step1.categories.${item.category}`, {
											defaultValue: item.category,
										})}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={selectedCity || "all"} onValueChange={setSelectedCity}>
							<SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
								<SelectValue placeholder={t('search.city')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t('search.allCities')}</SelectItem>
								{taxonomy.locations.map(c => (
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

						<div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
							<Button size="lg" className="w-full md:w-auto px-10 font-bold text-lg h-12" onClick={handleSearch}>
								{t('search.submit')}
							</Button>
							{error || modelError ? (
								<Button variant="ghost" size="sm" onClick={retry}>
									{t('common:errorBoundary.retry')}
								</Button>
							) : null}
						</div>
					</div>

				</div>
			</div>
		</div>
	);
}
