"use client";

import { useEffect, useState } from "react";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { VehicleSummary } from "@/types/vehicle";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RelatedCarsProps {
    listingId: string;
}

export function RelatedCars({ listingId }: RelatedCarsProps) {
    const { t } = useTranslation('carDetail');
    const [cars, setCars] = useState<VehicleSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listingId}/similar`)
            .then((res) => res.json())
            .then((json) => setCars(json.data || []))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [listingId]);

    if (!isLoading && cars.length === 0) return null;

    return (
        <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight">{t('similarListings')}</h2>
                <div className="flex gap-2">
                    {/* Mock scroll buttons */}
                    <button className="p-2 border border-border rounded-full hover:bg-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="p-2 border border-border rounded-full hover:bg-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-xl" />
                    ))
                ) : (
                    cars.map((car) => (
                        <VehicleCard key={car.id} vehicle={car} variant="grid" />
                    ))
                )}
            </div>
        </section>
    );
}
