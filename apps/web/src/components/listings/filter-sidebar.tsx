"use client";

import { useEffect, useState } from "react";
import { useFilterStore } from "@/store/use-filter-store";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { useTranslation } from "react-i18next";

export function FilterSidebar() {
    const { t } = useTranslation(['listings', 'common', 'sell']);
    const filters = useFilterStore();
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const currentMake = filters.make;

    // Fetch makes on mount
    useEffect(() => {
        fetch(`${API_URL}/api/search/makes`)
            .then((res) => res.json())
            .then((json) => setMakes(json.data || []))
            .catch(console.error);
    }, []);

    // Fetch models when make changes
    useEffect(() => {
        if (!currentMake || currentMake === "none") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setModels([]);
            return;
        }

        let cancelled = false;
        fetch(`${API_URL}/api/search/models?make=${currentMake}`)
            .then((res) => res.json())
            .then((json) => {
                if (!cancelled) setModels(json.data || []);
            })
            .catch(console.error);

        return () => {
            cancelled = true;
        };
    }, [currentMake]);

    const fuelTypes = ["Bensiin", "Diisel", "Hübriid", "Elekter", "Gaas"];
    const bodyTypes = ["Sedaan", "Universaal", "Maastur", "Kupee", "Kabriolett", "Mahtuniversaal", "Pikap", "Väikeautod"];

    const bodyTypeMap: Record<string, string> = {
        "Sedaan": "sedan",
        "Universaal": "wagon",
        "Maastur": "suv",
        "Kupee": "coupe",
        "Kabriolett": "convertible",
        "Mahtuniversaal": "minivan",
        "Pikap": "pickup",
        "Väikeautod": "small_car"
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
                    onClick={filters.resetFilters}
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
                    <Select value={filters.make} onValueChange={(val) => filters.setFilter("make", val)}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                            <SelectValue placeholder={t('filters.allMakes')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">{t('filters.allMakes')}</SelectItem>
                            {makes.map((make) => (
                                <SelectItem key={make} value={make}>{make}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.model}
                        onValueChange={(val) => filters.setFilter("model", val)}
                        disabled={!filters.make}
                    >
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                            <SelectValue placeholder={t('filters.allModels')} />
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
                            placeholder={t('filters.min')}
                            value={filters.priceMin}
                            onChange={(e) => filters.setFilter("priceMin", e.target.value)}
                            className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                        <Input
                            placeholder={t('filters.max')}
                            value={filters.priceMax}
                            onChange={(e) => filters.setFilter("priceMax", e.target.value)}
                            className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                    </div>
                </div>

                <Separator />

                {/* Year Range */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('filters.year')}</Label>
                    <div className="flex gap-2">
                        <Select value={filters.yearMin} onValueChange={(val) => filters.setFilter("yearMin", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filters.from')} />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filters.yearMax} onValueChange={(val) => filters.setFilter("yearMax", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filters.to')} />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />

                {/* Fuel Type */}
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('filters.fuelType')}</Label>
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
                                    {t(`options.fuel.${fuel}`, { ns: 'sell', defaultValue: fuel })}
                                </label>
                            </div>
                        ))}
                    </div>
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
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="automatic" id="t-auto" />
                            <Label htmlFor="t-auto" className="text-sm font-normal">{t('options.transmission.Automaat', { ns: 'sell' })}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="t-manual" />
                            <Label htmlFor="t-manual" className="text-sm font-normal">{t('options.transmission.Manuaal', { ns: 'sell' })}</Label>
                        </div>
                    </RadioGroup>
                </div>

                <Separator />

                {/* Body Type */}
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('filters.bodyType')}</Label>
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
                                    {t(`step1.types.${bodyTypeMap[body]}`, { ns: 'sell', defaultValue: body })}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50">
                <Button className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-105 transition-all">
                    {t('filters.showResults')}
                </Button>
            </div>
        </div>
    );
}
