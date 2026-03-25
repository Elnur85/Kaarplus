"use client";

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
import { BodyTypeFilter } from "@/components/listings/body-type-filter";
import { useVehicleTaxonomy } from "@/hooks/use-vehicle-taxonomy";

const conditionOptions = [
    { value: "New", key: "New" },
    { value: "Used", key: "Used" },
    { value: "Excellent", key: "Excellent" },
    { value: "Damaged", key: "Damaged" },
];

const doorOptions = ["2", "3", "4", "5"];
const seatOptions = ["2", "4", "5", "6", "7", "8+"];

export function AdvancedFilters() {
    const { t } = useTranslation(['search', 'sell']);
    const filters = useFilterStore();
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

    const activeFilterCount = getActiveFilterCount(filters);
    const yearMin = Math.min(taxonomy.years.min, taxonomy.years.max);
    const yearMax = Math.max(taxonomy.years.min, taxonomy.years.max);
    const yearOptions = Array.from(
        { length: Math.max(yearMax - yearMin + 1, 1) },
        (_, i) => yearMax - i
    );

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

            {(error || modelError) && (
                <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
                    <p className="text-sm text-destructive">
                        {t('metadata.error')}
                    </p>
                    <Button variant="ghost" size="sm" onClick={retry}>
                        {t('tryAgain')}
                    </Button>
                </div>
            )}

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
                                    value={filters.make || "none"}
                                    onValueChange={(val) => {
                                        filters.setFilter("make", val === "none" ? "" : val);
                                        filters.setFilter("model", "");
                                    }}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.make.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.make.placeholder')}</SelectItem>
                                        {taxonomy.makes.map((make) => (
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
                                    value={filters.model || "none"}
                                    onValueChange={(val) =>
                                        filters.setFilter("model", val === "none" ? "" : val)
                                    }
                                    disabled={!filters.make || filters.make === "none" || isLoadingModels}
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
                                        value={filters.yearMin || "none"}
                                        onValueChange={(val) =>
                                            filters.setFilter("yearMin", val === "none" ? "" : val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('fields.year.min')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">{t('fields.year.all')}</SelectItem>
                                            {yearOptions.map((y) => (
                                                <SelectItem key={y} value={y.toString()}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={filters.yearMax || "none"}
                                        onValueChange={(val) =>
                                            filters.setFilter("yearMax", val === "none" ? "" : val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('fields.year.max')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">{t('fields.year.all')}</SelectItem>
                                            {yearOptions.map((y) => (
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
                                    {taxonomy.fuelTypes.map((fuel) => (
                                        <div
                                            key={fuel}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`adv-fuel-${fuel}`}
                                                checked={filters.fuelType.includes(fuel)}
                                                onCheckedChange={() =>
                                                    filters.toggleFuelType(fuel)
                                                }
                                            />
                                            <label
                                                htmlFor={`adv-fuel-${fuel}`}
                                                className="text-sm leading-none cursor-pointer"
                                            >
                                                {t(`sell:options.fuel.${fuel}`, {
                                                    defaultValue: fuel,
                                                })}
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
                                    {taxonomy.transmissions.map((transmission) => (
                                        <div
                                            key={transmission}
                                            className="flex items-center space-x-2"
                                        >
                                            <RadioGroupItem
                                                value={transmission}
                                                id={`adv-t-${transmission}`}
                                            />
                                            <Label
                                                htmlFor={`adv-t-${transmission}`}
                                                className="text-sm font-normal"
                                            >
                                                {t(`sell:options.transmission.${transmission}`, {
                                                    defaultValue: transmission,
                                                })}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Body Type */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">
                                    {t('fields.body.label')}
                                </Label>
                                <BodyTypeFilter
                                    hierarchy={taxonomy.bodyTypeHierarchy}
                                    isLoading={isLoading}
                                />
                            </div>

                            {/* Drive Type */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {t('fields.drive.label')}
                                </Label>
                                <Select
                                    value={filters.driveType || "none"}
                                    onValueChange={(val) =>
                                        filters.setFilter("driveType", val === "none" ? "" : val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.drive.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.drive.placeholder')}</SelectItem>
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
                                    value={filters.color || "none"}
                                    onValueChange={(val) =>
                                        filters.setFilter("color", val === "none" ? "" : val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.color.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.color.placeholder')}</SelectItem>
                                        {taxonomy.colors.map((c) => (
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
                                    value={filters.doors || "none"}
                                    onValueChange={(val) =>
                                        filters.setFilter("doors", val === "none" ? "" : val)
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
                                    value={filters.seats || "none"}
                                    onValueChange={(val) =>
                                        filters.setFilter("seats", val === "none" ? "" : val)
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
                                    value={filters.condition || "none"}
                                    onValueChange={(val) =>
                                        filters.setFilter("condition", val === "none" ? "" : val)
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
                                    value={filters.location || "none"}
                                    onValueChange={(val) =>
                                        filters.setFilter("location", val === "none" ? "" : val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('fields.location.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('fields.location.placeholder')}</SelectItem>
                                        {taxonomy.locations.map((loc) => (
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
    if (filters.bodyTypeSelections.length > 0) count++;
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
