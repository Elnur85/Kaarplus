"use client";

import { useEffect, useRef, useState } from "react";
import { useFilterStore } from "@/store/use-filter-store";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FUEL_TYPES, DRIVE_TYPES, BODY_TYPES, API_URL } from "@/lib/constants";

const fuelTypes = FUEL_TYPES.filter(f => f !== "Ethanol").map(f => ({ value: f, key: f }));

const bodyTypes = BODY_TYPES.map(b => ({ value: b, key: b }));

const driveTypes = DRIVE_TYPES.map(d => ({ value: d, key: d }));

const conditionOptions = [
    { value: "New", key: "New" },
    { value: "Used", key: "Used" },
    { value: "Excellent", key: "Excellent" },
    { value: "Damaged", key: "Damaged" },
];

const doorOptions = ["2", "3", "4", "5"];
const seatOptions = ["2", "4", "5", "6", "7", "8+"];

export function AdvancedFilters() {
    const { t } = useTranslation('search');
    const filters = useFilterStore();
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const currentMake = filters.make;

    useEffect(() => {
        const safeFetch = (url: string) =>
            fetch(url).then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            });

        Promise.all([
            safeFetch(`${API_URL}/search/makes`),
            safeFetch(`${API_URL}/search/locations`),
            safeFetch(`${API_URL}/search/colors`),
        ])
            .then(([makesJson, locationsJson, colorsJson]) => {
                setMakes(makesJson.data || []);
                setLocations(locationsJson.data || []);
                setColors(colorsJson.data || []);
            })
            .catch(() => {
                // Filter options will remain empty — dropdowns degrade gracefully
            });
    }, []);

    useEffect(() => {
        if (!currentMake || currentMake === "none") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setModels(prev => prev.length === 0 ? prev : []);
            return;
        }

        let cancelled = false;
        fetch(`${API_URL}/search/models?make=${encodeURIComponent(currentMake)}`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json) => {
                if (!cancelled) setModels(json.data || []);
            })
            .catch(() => {
                // Model dropdown will remain empty
            });

        return () => {
            cancelled = true;
        };
    }, [currentMake]);

    const activeFilterCount = getActiveFilterCount(filters);

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <Search size={18} className="text-primary" />
                    {t('title')}
                </h2>
                <div className="flex items-center gap-3">
                    {activeFilterCount > 0 && (
                        <span className="text-xs font-medium text-muted-foreground">
                            {t('filters.count', { count: activeFilterCount })}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto"
                        onClick={filters.resetFilters}
                    >
                        <RotateCcw size={12} className="mr-1" /> {t('filters.reset')}
                    </Button>
                </div>
            </div>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                <Accordion
                    type="multiple"
                    defaultValue={["basic", "price", "year-mileage", "technical"]}
                    className="px-5"
                >
                    {/* Basic Search */}
                    <AccordionItem value="basic">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            {t('sections.basic')}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pb-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.query.label')}
                                </Label>
                                <Input
                                    placeholder={t('fields.query.placeholder')}
                                    value={filters.q}
                                    onChange={(e) => filters.setFilter("q", e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.make.label')}
                                </Label>
                                <Select
                                    value={filters.make}
                                    onValueChange={(val) => {
                                        filters.setFilter("make", val);
                                        filters.setFilter("model", "");
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.make.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.make.placeholder')}</SelectItem>
                                        {makes.map((make) => (
                                            <SelectItem key={make} value={make}>
                                                {make}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.model.label')}
                                </Label>
                                <Select
                                    value={filters.model}
                                    onValueChange={(val) => filters.setFilter("model", val)}
                                    disabled={!filters.make || filters.make === "none"}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.model.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.model.placeholder')}</SelectItem>
                                        {models.map((model) => (
                                            <SelectItem key={model} value={model}>
                                                {model}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Price */}
                    <AccordionItem value="price">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            {t('sections.price')}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <div className="flex gap-2 items-center">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder={t('fields.price.min')}
                                        value={filters.priceMin}
                                        onChange={(e) =>
                                            filters.setFilter("priceMin", e.target.value)
                                        }
                                        className="text-sm pr-7"
                                        type="number"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        &euro;
                                    </span>
                                </div>
                                <span className="text-muted-foreground text-sm">-</span>
                                <div className="relative flex-1">
                                    <Input
                                        placeholder={t('fields.price.max')}
                                        value={filters.priceMax}
                                        onChange={(e) =>
                                            filters.setFilter("priceMax", e.target.value)
                                        }
                                        className="text-sm pr-7"
                                        type="number"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        &euro;
                                    </span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Year & Mileage */}
                    <AccordionItem value="year-mileage">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            {t('sections.yearMileage')}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pb-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.year.label')}
                                </Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={filters.yearMin}
                                        onValueChange={(val) =>
                                            filters.setFilter("yearMin", val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('fields.year.min')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">{t('fields.year.all')}</SelectItem>
                                            {Array.from(
                                                { length: 30 },
                                                (_, i) => new Date().getFullYear() - i
                                            ).map((y) => (
                                                <SelectItem key={y} value={y.toString()}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={filters.yearMax}
                                        onValueChange={(val) =>
                                            filters.setFilter("yearMax", val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('fields.year.max')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">{t('fields.year.all')}</SelectItem>
                                            {Array.from(
                                                { length: 30 },
                                                (_, i) => new Date().getFullYear() - i
                                            ).map((y) => (
                                                <SelectItem key={y} value={y.toString()}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.mileage.label')}
                                </Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        placeholder={t('fields.mileage.min')}
                                        value={filters.mileageMin}
                                        onChange={(e) =>
                                            filters.setFilter("mileageMin", e.target.value)
                                        }
                                        className="text-sm"
                                        type="number"
                                    />
                                    <span className="text-muted-foreground text-sm">-</span>
                                    <Input
                                        placeholder={t('fields.mileage.max')}
                                        value={filters.mileageMax}
                                        onChange={(e) =>
                                            filters.setFilter("mileageMax", e.target.value)
                                        }
                                        className="text-sm"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Technical */}
                    <AccordionItem value="technical">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            {t('sections.technical')}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-5 pb-4">
                            {/* Fuel Type */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">
                                    {t('fields.fuel.label')}
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {fuelTypes.map((fuel) => (
                                        <div
                                            key={fuel.value}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`adv-fuel-${fuel.value}`}
                                                checked={filters.fuelType.includes(fuel.value)}
                                                onCheckedChange={() =>
                                                    filters.toggleFuelType(fuel.value)
                                                }
                                            />
                                            <label
                                                htmlFor={`adv-fuel-${fuel.value}`}
                                                className="text-sm leading-none cursor-pointer"
                                            >
                                                {t(`fields.fuel.types.${fuel.key}`)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Transmission */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">
                                    {t('fields.transmission.label')}
                                </Label>
                                <RadioGroup
                                    value={filters.transmission}
                                    onValueChange={(val) =>
                                        filters.setFilter("transmission", val)
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="adv-t-all" />
                                        <Label
                                            htmlFor="adv-t-all"
                                            className="text-sm font-normal"
                                        >
                                            {t('fields.transmission.options.all')}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="automatic" id="adv-t-auto" />
                                        <Label
                                            htmlFor="adv-t-auto"
                                            className="text-sm font-normal"
                                        >
                                            {t('fields.transmission.options.automatic')}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="manual" id="adv-t-manual" />
                                        <Label
                                            htmlFor="adv-t-manual"
                                            className="text-sm font-normal"
                                        >
                                            {t('fields.transmission.options.manual')}
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Body Type */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">
                                    {t('fields.body.label')}
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {bodyTypes.map((body) => (
                                        <div
                                            key={body.value}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`adv-body-${body.value}`}
                                                checked={filters.bodyType.includes(body.value)}
                                                onCheckedChange={() =>
                                                    filters.toggleBodyType(body.value)
                                                }
                                            />
                                            <label
                                                htmlFor={`adv-body-${body.value}`}
                                                className="text-sm leading-none cursor-pointer"
                                            >
                                                {t(`fields.body.types.${body.key}`)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Drive Type */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.drive.label')}
                                </Label>
                                <Select
                                    value={filters.driveType}
                                    onValueChange={(val) =>
                                        filters.setFilter("driveType", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.drive.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.drive.placeholder')}</SelectItem>
                                        {driveTypes.map((dt) => (
                                            <SelectItem key={dt.value} value={dt.value}>
                                                {t(`fields.drive.options.${dt.key}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Power */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.power.label')}
                                </Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        placeholder={t('fields.power.min')}
                                        value={filters.powerMin}
                                        onChange={(e) =>
                                            filters.setFilter("powerMin", e.target.value)
                                        }
                                        className="text-sm"
                                        type="number"
                                    />
                                    <span className="text-muted-foreground text-sm">-</span>
                                    <Input
                                        placeholder={t('fields.power.max')}
                                        value={filters.powerMax}
                                        onChange={(e) =>
                                            filters.setFilter("powerMax", e.target.value)
                                        }
                                        className="text-sm"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Appearance */}
                    <AccordionItem value="appearance">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            {t('sections.appearance')}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pb-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.color.label')}
                                </Label>
                                <Select
                                    value={filters.color}
                                    onValueChange={(val) =>
                                        filters.setFilter("color", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.color.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.color.placeholder')}</SelectItem>
                                        {colors.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.doors.label')}
                                </Label>
                                <Select
                                    value={filters.doors}
                                    onValueChange={(val) =>
                                        filters.setFilter("doors", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.doors.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.doors.placeholder')}</SelectItem>
                                        {doorOptions.map((d) => (
                                            <SelectItem key={d} value={d}>
                                                {d}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.seats.label')}
                                </Label>
                                <Select
                                    value={filters.seats}
                                    onValueChange={(val) =>
                                        filters.setFilter("seats", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.seats.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.seats.placeholder')}</SelectItem>
                                        {seatOptions.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Condition & Location */}
                    <AccordionItem value="condition-location">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            {t('sections.conditionLocation')}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pb-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.condition.label')}
                                </Label>
                                <Select
                                    value={filters.condition}
                                    onValueChange={(val) =>
                                        filters.setFilter("condition", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.condition.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.condition.placeholder')}</SelectItem>
                                        {conditionOptions.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {t(`fields.condition.options.${c.key}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.location.label')}
                                </Label>
                                <Select
                                    value={filters.location}
                                    onValueChange={(val) =>
                                        filters.setFilter("location", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.location.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.location.placeholder')}</SelectItem>
                                        {locations.map((loc) => (
                                            <SelectItem key={loc} value={loc}>
                                                {loc}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <div className="p-5 border-t border-border bg-muted/50">
                <Button className="w-full font-bold shadow-md shadow-primary/20">
                    {t('filters.showResults')}
                </Button>
            </div>
        </div>
    );
}


function getActiveFilterCount(filters: ReturnType<typeof useFilterStore.getState>): number {
    let count = 0;
    if (filters.make && filters.make !== "none") count++;
    if (filters.model && filters.model !== "none") count++;
    if (filters.q) count++;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.yearMin && filters.yearMin !== "none") count++;
    if (filters.yearMax && filters.yearMax !== "none") count++;
    if (filters.fuelType.length > 0) count++;
    if (filters.transmission !== "all") count++;
    if (filters.bodyType.length > 0) count++;
    if (filters.color && filters.color !== "none") count++;
    if (filters.mileageMin) count++;
    if (filters.mileageMax) count++;
    if (filters.powerMin) count++;
    if (filters.powerMax) count++;
    if (filters.driveType && filters.driveType !== "none") count++;
    if (filters.doors && filters.doors !== "none") count++;
    if (filters.seats && filters.seats !== "none") count++;
    if (filters.condition && filters.condition !== "none") count++;
    if (filters.location && filters.location !== "none") count++;
    return count;
}
