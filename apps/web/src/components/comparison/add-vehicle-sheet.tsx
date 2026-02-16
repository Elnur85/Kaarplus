"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/utils";
import { CompareVehicle, useCompareStore } from "@/store/use-compare-store";

interface ListingResult {
    id: string;
    make: string;
    model: string;
    variant?: string;
    year: number;
    price: number;
    priceVatIncluded: boolean;
    mileage: number;
    fuelType: string;
    transmission: string;
    bodyType: string;
    powerKw: number;
    driveType?: string;
    doors?: number;
    seats?: number;
    colorExterior: string;
    colorInterior?: string;
    condition: string;
    location: string;
    features: Record<string, boolean | string>;
    images?: { url: string }[];
}

interface AddVehicleSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

import { useTranslation } from "react-i18next";

export function AddVehicleSheet({ open, onOpenChange }: AddVehicleSheetProps) {
    const { t } = useTranslation('compare');
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ListingResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addVehicle, isInCompare } = useCompareStore();

    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/listings?q=${encodeURIComponent(query)}&pageSize=10&status=ACTIVE`
                );
                const json = await res.json();
                setResults(json.data || []);
            } catch {
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    const handleAdd = (listing: ListingResult) => {
        const vehicle: CompareVehicle = {
            id: listing.id,
            make: listing.make,
            model: listing.model,
            variant: listing.variant,
            year: listing.year,
            price: Number(listing.price),
            priceVatIncluded: listing.priceVatIncluded,
            mileage: listing.mileage,
            fuelType: listing.fuelType,
            transmission: listing.transmission,
            bodyType: listing.bodyType,
            powerKw: listing.powerKw,
            driveType: listing.driveType,
            doors: listing.doors,
            seats: listing.seats,
            colorExterior: listing.colorExterior,
            colorInterior: listing.colorInterior,
            condition: listing.condition,
            location: listing.location,
            features:
                typeof listing.features === "object" && listing.features !== null
                    ? (listing.features as Record<string, boolean | string>)
                    : {},
            imageUrl: listing.images?.[0]?.url,
        };
        addVehicle(vehicle);
        onOpenChange(false);
        setQuery("");
        setResults([]);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t('addSheet.title')}</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            placeholder={t('addSheet.placeholder')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {isLoading && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {t('addSheet.loading')}
                        </p>
                    )}

                    {!isLoading && results.length === 0 && query.length >= 2 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {t('addSheet.noResults')}
                        </p>
                    )}

                    <div className="space-y-2">
                        {results.map((listing) => {
                            const alreadyAdded = isInCompare(listing.id);

                            return (
                                <div
                                    key={listing.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="w-16 h-12 rounded overflow-hidden bg-muted shrink-0 relative">
                                        {listing.images?.[0]?.url ? (
                                            <Image
                                                src={listing.images[0].url}
                                                alt={`${listing.make} ${listing.model}`}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {listing.year} {listing.make} {listing.model}
                                        </p>
                                        <p className="text-xs text-primary font-semibold">
                                            {formatPrice(Number(listing.price), listing.priceVatIncluded)}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={alreadyAdded ? "outline" : "default"}
                                        disabled={alreadyAdded}
                                        onClick={() => handleAdd(listing)}
                                        className="shrink-0"
                                    >
                                        {alreadyAdded ? (
                                            <X size={14} />
                                        ) : (
                                            <Plus size={14} />
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
