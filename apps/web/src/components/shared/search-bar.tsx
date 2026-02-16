"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function SearchBar() {
    const router = useRouter();
    const { t } = useTranslation(['listings', 'home']);
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [yearMin, setYearMin] = useState("");
    const [yearMax, setYearMax] = useState("");
    const [priceMax, setPriceMax] = useState("");

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (make) params.set("make", make);
        if (model) params.set("model", model);
        if (yearMin) params.set("yearMin", yearMin);
        if (yearMax) params.set("yearMax", yearMax);
        if (priceMax) params.set("priceMax", priceMax);

        router.push(`/listings?${params.toString()}`);
    };

    const labelStyle = "text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 block";

    return (
        <div className="w-full max-w-5xl bg-white dark:bg-slate-900/95 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            {/* Make */}
            <div className="space-y-1.5">
                <label className={labelStyle}>{t('filters.make')}</label>
                <Select value={make} onValueChange={setMake}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                        <SelectValue placeholder={t('filters.make')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bmw">BMW</SelectItem>
                        <SelectItem value="audi">Audi</SelectItem>
                        <SelectItem value="volkswagen">Volkswagen</SelectItem>
                        <SelectItem value="toyota">Toyota</SelectItem>
                        <SelectItem value="mercedes-benz">Mercedes-Benz</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Model */}
            <div className="space-y-1.5">
                <label className={labelStyle}>{t('filters.model')}</label>
                <Select value={model} onValueChange={setModel} disabled={!make}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                        <SelectValue placeholder={t('filters.model')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="3-series">3. seeria</SelectItem>
                        <SelectItem value="5-series">5. seeria</SelectItem>
                        <SelectItem value="x5">X5</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Year Range */}
            <div className="space-y-1.5">
                <label className={labelStyle}>{t('filters.year')} {t('filters.from', { defaultValue: 'alates' })}</label>
                <Select value={yearMin} onValueChange={setYearMin}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                        <SelectValue placeholder={t('filters.from', { defaultValue: 'Alates' })} />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <label className={labelStyle}>{t('filters.year')} {t('filters.to', { defaultValue: 'kuni' })}</label>
                <Select value={yearMax} onValueChange={setYearMax}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                        <SelectValue placeholder={t('filters.to', { defaultValue: 'Kuni' })} />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
                <label className={labelStyle}>{t('filters.price')} Max</label>
                <Select value={priceMax} onValueChange={setPriceMax}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                        <SelectValue placeholder={t('filters.price')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5000">5 000 €</SelectItem>
                        <SelectItem value="10000">10 000 €</SelectItem>
                        <SelectItem value="15000">15 000 €</SelectItem>
                        <SelectItem value="20000">20 000 €</SelectItem>
                        <SelectItem value="30000">30 000 €</SelectItem>
                        <SelectItem value="50000">5 0000 €</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Button */}
            <div className="flex items-end">
                <Button
                    className="w-full bg-primary hover:bg-primary/90 h-[42px] rounded-lg font-bold transition-all shadow-lg shadow-primary/30 gap-2"
                    onClick={handleSearch}
                >
                    <Search className="h-4 w-4" /> {t('home:hero.cta')}
                </Button>
            </div>
        </div>
    );
}
