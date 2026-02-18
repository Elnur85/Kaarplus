"use client";

import { useEffect, useState, useRef } from "react";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { VehicleSummary } from "@/types/vehicle";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { API_URL } from "@/lib/constants";

interface RelatedCarsProps {
    listingId: string;
}

export function RelatedCars({ listingId }: RelatedCarsProps) {
    const { t } = useTranslation('carDetail');
    const [cars, setCars] = useState<VehicleSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${API_URL}/listings/${listingId}/similar`)
            .then((res) => res.json())
            .then((json) => setCars(json.data || []))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [listingId]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320; // Approximate card width + gap
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!isLoading && cars.length === 0) return null;

    return (
        <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight">{t('similarListings')}</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={() => scroll('left')}
                        className="p-2 border border-border rounded-full hover:bg-white transition-colors disabled:opacity-50"
                        disabled={isLoading || cars.length === 0}
                        aria-label={t('scrollLeft', { defaultValue: 'Scroll left' })}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="p-2 border border-border rounded-full hover:bg-white transition-colors disabled:opacity-50"
                        disabled={isLoading || cars.length === 0}
                        aria-label={t('scrollRight', { defaultValue: 'Scroll right' })}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div 
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-72 aspect-[4/5] bg-muted animate-pulse rounded-xl" />
                    ))
                ) : (
                    cars.map((car) => (
                        <div key={car.id} className="flex-shrink-0 w-72 snap-start">
                            <VehicleCard vehicle={car} variant="grid" />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
