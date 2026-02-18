"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/constants";
import { useFilterStore } from "@/store/use-filter-store";

interface FilterOptions {
    makes: string[];
    years: {
        min: number;
        max: number;
    };
    price: {
        min: number;
        max: number;
    };
}

export function SearchBar() {
    const router = useRouter();
    const { t } = useTranslation(['listings', 'home', 'common']);
    const filterStore = useFilterStore();
    
    // Local state for form inputs
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [yearMin, setYearMin] = useState("");
    const [yearMax, setYearMax] = useState("");
    const [priceMax, setPriceMax] = useState("");
    
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
    const [isLoadingMakes, setIsLoadingMakes] = useState(true);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

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
                }
            });
            
        return () => {
            cancelled = true;
        };
    }, []);

    // Fetch models when make changes
    useEffect(() => {
        if (!make) {
            // Clear models when no make is selected
            setModels([]);
            setModel("");
            return;
        }

        let cancelled = false;
        
        const loadModels = async () => {
            setIsLoadingModels(true);
            try {
                const res = await fetch(`${API_URL}/search/models?make=${encodeURIComponent(make)}`);
                const json = await res.json();
                if (!cancelled) {
                    setModels(json.data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!cancelled) {
                    setIsLoadingModels(false);
                }
            }
        };
        
        loadModels();
        
        return () => {
            cancelled = true;
        };
    }, [make]);

    // Handle yearMin change with validation - swaps values if range is invalid
    const handleYearMinChange = useCallback((val: string) => {
        const yearValue = val === "any" ? "" : val;
        const yearNum = yearValue ? parseInt(yearValue) : null;
        const currentMax = yearMax ? parseInt(yearMax) : null;
        
        // If setting yearMin and it's greater than yearMax, swap the values
        if (yearNum && currentMax && yearNum > currentMax) {
            setYearMax(yearValue);
            setYearMin(yearMax);
        } else {
            setYearMin(yearValue);
        }
    }, [yearMax]);

    // Handle yearMax change with validation - swaps values if range is invalid
    const handleYearMaxChange = useCallback((val: string) => {
        const yearValue = val === "any" ? "" : val;
        const yearNum = yearValue ? parseInt(yearValue) : null;
        const currentMin = yearMin ? parseInt(yearMin) : null;
        
        // If setting yearMax and it's less than yearMin, swap the values
        if (yearNum && currentMin && yearNum < currentMin) {
            setYearMin(yearValue);
            setYearMax(yearMin);
        } else {
            setYearMax(yearValue);
        }
    }, [yearMin]);

    const handleSearch = useCallback(() => {
        // Update the global filter store
        filterStore.setFilter("make", make);
        filterStore.setFilter("model", model);
        filterStore.setFilter("yearMin", yearMin);
        filterStore.setFilter("yearMax", yearMax);
        filterStore.setFilter("priceMax", priceMax);
        
        // Build URL params
        const params = new URLSearchParams();
        if (make) params.set("make", make);
        if (model) params.set("model", model);
        if (yearMin) params.set("yearMin", yearMin);
        if (yearMax) params.set("yearMax", yearMax);
        if (priceMax) params.set("priceMax", priceMax);

        router.push(`/listings?${params.toString()}`);
    }, [make, model, yearMin, yearMax, priceMax, router, filterStore]);

    // Generate year options from filter options or fallback
    const currentYear = new Date().getFullYear();
    const minYear = filterOptions?.years?.min || 2000;
    const yearOptions = Array.from(
        { length: currentYear - minYear + 1 }, 
        (_, i) => currentYear - i
    );

    // Price options in euros
    const priceOptions = [
        { value: "5000", label: "5 000 €" },
        { value: "10000", label: "10 000 €" },
        { value: "15000", label: "15 000 €" },
        { value: "20000", label: "20 000 €" },
        { value: "30000", label: "30 000 €" },
        { value: "50000", label: "50 000 €" },
        { value: "75000", label: "75 000 €" },
        { value: "100000", label: "100 000 €" },
    ];

    const labelStyle = "text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 block";

    return (
        <div className="w-full max-w-5xl bg-white dark:bg-slate-900/95 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            {/* Make */}
            <div className="space-y-1.5">
                <label className={labelStyle}>{t('filters.make')}</label>
                <Select 
                    value={make || "all"} 
                    onValueChange={(val) => setMake(val === "all" ? "" : val)} 
                    disabled={isLoadingMakes}
                >
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                        <SelectValue placeholder={isLoadingMakes ? t('common.loading', { defaultValue: 'Loading...' }) : t('filters.make')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('filters.allMakes')}</SelectItem>
                        {makes.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Model */}
            <div className="space-y-1.5">
                <label className={labelStyle}>{t('filters.model')}</label>
                <Select 
                    value={model || "all"} 
                    onValueChange={(val) => setModel(val === "all" ? "" : val)} 
                    disabled={!make || isLoadingModels}
                >
                    <SelectTrigger className={cn(
                        "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg",
                        !make && "opacity-50"
                    )}>
                        <SelectValue placeholder={isLoadingModels ? t('common.loading', { defaultValue: 'Loading...' }) : t('filters.model')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('filters.allModels')}</SelectItem>
                        {models.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Year Range */}
            <div className="space-y-1.5">
                <label className={labelStyle}>{t('filters.year')} {t('filters.from', { defaultValue: 'from' })}</label>
                <Select 
                    value={yearMin || "any"} 
                    onValueChange={handleYearMinChange}
                >
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                        <SelectValue placeholder={t('filters.from', { defaultValue: 'From' })} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">{t('filters.any')}</SelectItem>
                        {yearOptions.map((year) => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <label className={labelStyle}>{t('filters.year')} {t('filters.to', { defaultValue: 'to' })}</label>
                <Select 
                    value={yearMax || "any"} 
                    onValueChange={handleYearMaxChange}
                >
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                        <SelectValue placeholder={t('filters.to', { defaultValue: 'To' })} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">{t('filters.any')}</SelectItem>
                        {yearOptions.map((year) => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
                <label className={labelStyle}>{t('filters.price')} Max</label>
                <Select value={priceMax || "any"} onValueChange={(val) => setPriceMax(val === "any" ? "" : val)}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                        <SelectValue placeholder={t('filters.price')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">{t('filters.any')}</SelectItem>
                        {priceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Button */}
            <div className="flex items-end">
                <Button
                    className="w-full bg-primary hover:bg-primary/90 h-[42px] rounded-lg font-bold transition-all shadow-lg shadow-primary/30 gap-2"
                    onClick={handleSearch}
                    disabled={isLoadingMakes}
                >
                    {isLoadingMakes ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                    {t('home:hero.cta')}
                </Button>
            </div>
        </div>
    );
}
