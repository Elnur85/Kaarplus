"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { VehicleSummary } from "@/types/vehicle";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { API_URL } from "@/lib/constants";

interface RelatedCarsProps {
    listingId: string;
}

// API returns images array, but VehicleSummary expects thumbnailUrl
interface ApiListing {
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
    powerKw?: number;
    bodyType: string;
    status: "ACTIVE" | "PENDING" | "SOLD" | "REJECTED" | "EXPIRED";
    badges?: Array<"new" | "hot_deal" | "certified" | "verified">;
    isFavorited?: boolean;
    isSponsored?: boolean;
    createdAt: string;
    location?: string;
    images?: { url: string }[];
    user?: {
        name: string | null;
        role: "USER" | "DEALERSHIP" | "ADMIN" | "SUPPORT";
        dealershipId: string | null;
    };
}

function mapApiToVehicleSummary(listing: ApiListing): VehicleSummary {
    return {
        id: listing.id,
        make: listing.make,
        model: listing.model,
        variant: listing.variant,
        year: listing.year,
        price: listing.price,
        priceVatIncluded: listing.priceVatIncluded,
        mileage: listing.mileage,
        fuelType: listing.fuelType,
        transmission: listing.transmission,
        powerKw: listing.powerKw,
        bodyType: listing.bodyType,
        thumbnailUrl: listing.images?.[0]?.url ?? "",
        status: listing.status,
        badges: listing.badges,
        isFavorited: listing.isFavorited,
        isSponsored: listing.isSponsored,
        createdAt: listing.createdAt,
        location: listing.location,
        user: listing.user,
    };
}

export function RelatedCars({ listingId }: RelatedCarsProps) {
    const { t } = useTranslation('carDetail');
    const [cars, setCars] = useState<VehicleSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${API_URL}/listings/${listingId}/similar`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json) => {
                const apiListings: ApiListing[] = json.data || [];
                setCars(apiListings.map(mapApiToVehicleSummary));
            })
            .catch(() => {
                // Related cars section degrades gracefully — hides if empty
            })
            .finally(() => setIsLoading(false));
    }, [listingId]);

    const checkScrollability = useCallback(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
        }
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollability);
            checkScrollability();
            return () => container.removeEventListener('scroll', checkScrollability);
        }
    }, [checkScrollability, cars]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) {
            const cardWidth = 288 + 24; // w-72 (288px) + gap-6 (24px)
            const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
            container.scrollBy({
                left: scrollAmount,
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
                        className="p-2 border border-border rounded-full hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-background"
                        disabled={isLoading || !canScrollLeft}
                        aria-label={t('scrollLeft', { defaultValue: 'Scroll left' })}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="p-2 border border-border rounded-full hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-background"
                        disabled={isLoading || !canScrollRight}
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
