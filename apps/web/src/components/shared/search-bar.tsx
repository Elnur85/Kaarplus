"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

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

    return (
        <div className="w-full max-w-4xl bg-white p-4 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
            {/* Make */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t('filters.make')}</label>
                <Select value={make} onValueChange={setMake}>
                    <SelectTrigger>
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
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t('filters.model')}</label>
                <Select value={model} onValueChange={setModel} disabled={!make}>
                    <SelectTrigger>
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
            <div className="col-span-1 lg:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t('filters.year')} {t('filters.from', { defaultValue: 'alates' })}</label>
                <Select value={yearMin} onValueChange={setYearMin}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('filters.from', { defaultValue: 'Alates' })} />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="col-span-1 lg:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t('filters.year')} {t('filters.to', { defaultValue: 'kuni' })}</label>
                <Select value={yearMax} onValueChange={setYearMax}>
                    <SelectTrigger>
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
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t('filters.price')} (€)</label>
                <Select value={priceMax} onValueChange={setPriceMax}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('filters.price')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5000">5 000 €</SelectItem>
                        <SelectItem value="10000">10 000 €</SelectItem>
                        <SelectItem value="15000">15 000 €</SelectItem>
                        <SelectItem value="20000">20 000 €</SelectItem>
                        <SelectItem value="30000">30 000 €</SelectItem>
                        <SelectItem value="50000">50 000 €</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Button */}
            <div className="col-span-1 md:col-span-4 lg:col-span-1">
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSearch}>
                    <Search className="mr-2 h-4 w-4" /> {t('home:hero.cta')}
                </Button>
            </div>
        </div>
    );
}
