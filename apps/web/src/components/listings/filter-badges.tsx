"use client";

import { useFilterStore, FilterState } from "@/store/use-filter-store";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function FilterBadges() {
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

    return (
        <div className="flex flex-wrap items-center gap-2">
            {filters.make && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Mark: {filters.make}
                    <button onClick={() => removeBadge("make")} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.model && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Mudel: {filters.model}
                    <button onClick={() => removeBadge("model")} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {(filters.priceMin || filters.priceMax) && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Hind: {filters.priceMin || "0"} - {filters.priceMax || "..."} €
                    <button onClick={() => { filters.setFilter("priceMin", ""); filters.setFilter("priceMax", ""); }} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {(filters.yearMin || filters.yearMax) && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Aasta: {filters.yearMin || "..."} - {filters.yearMax || "..."}
                    <button onClick={() => { filters.setFilter("yearMin", ""); filters.setFilter("yearMax", ""); }} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.fuelType.map((fuel) => (
                <Badge key={fuel} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Kütus: {fuel}
                    <button onClick={() => removeBadge("fuelType", fuel)} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            ))}
            {filters.transmission !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Käigukast: {filters.transmission === "automatic" ? "Automaat" : "Manuaal"}
                    <button onClick={() => removeBadge("transmission")} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.bodyType.map((body) => (
                <Badge key={body} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Kere: {body}
                    <button onClick={() => removeBadge("bodyType", body)} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            ))}
            {(filters.mileageMin || filters.mileageMax) && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Läbisõit: {filters.mileageMin || "0"} - {filters.mileageMax || "..."} km
                    <button onClick={() => { filters.setFilter("mileageMin", ""); filters.setFilter("mileageMax", ""); }} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {(filters.powerMin || filters.powerMax) && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Võimsus: {filters.powerMin || "0"} - {filters.powerMax || "..."} kW
                    <button onClick={() => { filters.setFilter("powerMin", ""); filters.setFilter("powerMax", ""); }} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.driveType && filters.driveType !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Vedu: {filters.driveType}
                    <button onClick={() => removeBadge("driveType")} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.color && filters.color !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Värv: {filters.color}
                    <button onClick={() => removeBadge("color")} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.doors && filters.doors !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Uksi: {filters.doors}
                    <button onClick={() => removeBadge("doors")} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.seats && filters.seats !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Istekohti: {filters.seats}
                    <button onClick={() => removeBadge("seats")} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.condition && filters.condition !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Seisukord: {filters.condition === "new" ? "Uus" : filters.condition === "used" ? "Kasutatud" : "Sertifitseeritud"}
                    <button onClick={() => removeBadge("condition")} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.location && filters.location !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Asukoht: {filters.location}
                    <button onClick={() => removeBadge("location")} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}
            {filters.q && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-card border-border hover:bg-muted/80">
                    Otsing: &quot;{filters.q}&quot;
                    <button onClick={() => removeBadge("q")} aria-label="Eemalda filtr">
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                </Badge>
            )}

            <button
                onClick={filters.resetFilters}
                className="text-xs font-bold text-primary hover:underline ml-2"
            >
                Puhasta kõik
            </button>
        </div>
    );
}
