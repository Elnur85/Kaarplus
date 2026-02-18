"use client";

import { useFilterStore, FilterState } from "@/store/use-filter-store";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

import { useTranslation } from "react-i18next";

export function FilterBadges() {
    const { t } = useTranslation(['listings', 'common', 'sell']);
    const filters = useFilterStore();

    const hasFilter =
        !!(filters.make ||
            filters.model ||
            filters.priceMin ||
            filters.priceMax ||
            filters.yearMin ||
            filters.yearMax ||
            filters.fuelType.length > 0 ||
            (filters.transmission && filters.transmission !== "all") ||
            filters.bodyType.length > 0 ||
            filters.q ||
            filters.mileageMin ||
            filters.mileageMax ||
            filters.powerMin ||
            filters.powerMax ||
            filters.driveType ||
            filters.color ||
            filters.doors ||
            filters.seats ||
            filters.condition ||
            filters.location);

    if (!hasFilter) return null;

    const removeBadge = (key: keyof FilterState, value?: string) => {
        if (key === "fuelType" && value) {
            filters.toggleFuelType(value);
        } else if (key === "bodyType" && value) {
            filters.toggleBodyType(value);
        } else if (key === "transmission") {
            filters.setFilter("transmission", "all");
        } else if (key === "page") {
            filters.setPage(1);
        } else if (key === "mileageMin" || key === "mileageMax" || key === "powerMin" || key === "powerMax" || key === "yearMin" || key === "yearMax") {
            filters.setFilter(key, "");
        } else {
            // @ts-ignore
            filters.setFilter(key, "");
        }
    };

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

    const getConditionLabel = (cond: string) => {
        switch (cond) {
            case "new": return t('options.condition.Uus', { ns: 'sell' });
            case "used": return t('options.condition.Kasutatud', { ns: 'sell' });
            case "certified": return t('badges.certified', { ns: 'listings' });
            default: return cond;
        }
    };

    const removeLabel = t('common.close', { ns: 'common' }); // Using 'close' as generic remove label or accessible text

    return (
        <div className="flex flex-wrap items-center gap-2">
            {filters.make && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('filters.make', { ns: 'listings' })}: {filters.make}
                    <button onClick={() => removeBadge("make")} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.model && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('filters.model', { ns: 'listings' })}: {filters.model}
                    <button onClick={() => removeBadge("model")} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {(filters.priceMin || filters.priceMax) && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('filters.price', { ns: 'listings' })}: {filters.priceMin || "0"} - {filters.priceMax || "..."} €
                    <button onClick={() => { filters.setFilter("priceMin", ""); filters.setFilter("priceMax", ""); }} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {(filters.yearMin || filters.yearMax) && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('filters.year', { ns: 'listings' })}: {filters.yearMin || "..."} - {filters.yearMax || "..."}
                    <button onClick={() => { filters.setFilter("yearMin", ""); filters.setFilter("yearMax", ""); }} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.fuelType.map((fuel) => (
                <Badge key={fuel} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('filters.fuelType', { ns: 'listings' })}: {t(`options.fuel.${fuel}`, { ns: 'sell', defaultValue: fuel })}
                    <button onClick={() => removeBadge("fuelType", fuel)} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            ))}
            {filters.transmission && filters.transmission !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('filters.transmission', { ns: 'listings' })}: {filters.transmission === "automatic" ? t('options.transmission.Automaat', { ns: 'sell' }) : t('options.transmission.Manuaal', { ns: 'sell' })}
                    <button onClick={() => removeBadge("transmission")} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.bodyType.map((body) => (
                <Badge key={body} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('filters.bodyType', { ns: 'listings' })}: {t(`step1.types.${bodyTypeMap[body]}`, { ns: 'sell', defaultValue: body })}
                    <button onClick={() => removeBadge("bodyType", body)} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            ))}
            {(filters.mileageMin || filters.mileageMax) && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('filters.mileage', { ns: 'listings' })}: {filters.mileageMin || "0"} - {filters.mileageMax || "..."} km
                    <button onClick={() => { filters.setFilter("mileageMin", ""); filters.setFilter("mileageMax", ""); }} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {(filters.powerMin || filters.powerMax) && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('card.power', { value: "", ns: 'listings' }).replace("0 kW", "").trim() || "Võimsus"}: {filters.powerMin || "0"} - {filters.powerMax || "..."} kW
                    <button onClick={() => { filters.setFilter("powerMin", ""); filters.setFilter("powerMax", ""); }} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.driveType && filters.driveType !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('specs.driveType', { ns: 'carDetail', defaultValue: 'Vedu' })}: {filters.driveType}
                    <button onClick={() => removeBadge("driveType")} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.color && filters.color !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Värv: {filters.color}
                    <button onClick={() => removeBadge("color")} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.doors && filters.doors !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('step2.labels.doors', { ns: 'sell', defaultValue: 'Uksi' }).replace('*', '')}: {filters.doors}
                    <button onClick={() => removeBadge("doors")} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.seats && filters.seats !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('step2.labels.seats', { ns: 'sell', defaultValue: 'Istekohti' }).replace('*', '')}: {filters.seats}
                    <button onClick={() => removeBadge("seats")} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.condition && filters.condition !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('specs.condition', { ns: 'carDetail', defaultValue: 'Seisukord' })}: {getConditionLabel(filters.condition)}
                    <button onClick={() => removeBadge("condition")} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.location && filters.location !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('filters.location', { ns: 'listings' })}: {filters.location}
                    <button onClick={() => removeBadge("location")} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.q && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    {t('common.search', { ns: 'common' })}: &quot;{filters.q}&quot;
                    <button onClick={() => removeBadge("q")} aria-label={removeLabel}>
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}

            <button
                onClick={filters.resetFilters}
                className="text-xs font-bold text-primary hover:underline ml-2"
            >
                {t('results.clearAll', { ns: 'listings' })}
            </button>
        </div>
    );
}
