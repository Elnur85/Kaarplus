"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/lib/utils";
import { API_URL } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface PlatformStats {
    totalListings: number;
    totalMakes: number;
    totalModels: number;
    totalLocations: number;
}

const Counter = ({ end, label, suffix = "+", isLoading = false }: { end: number, label: string, suffix?: string, isLoading?: boolean }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (isLoading) return;
        
        let start = 0;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start > end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [end, isLoading]);

    if (isLoading) {
        return (
            <div className="text-center">
                <Skeleton className="h-10 w-24 mx-auto mb-1 bg-white/20" />
                <Skeleton className="h-4 w-32 mx-auto bg-white/20" />
            </div>
        );
    }

    return (
        <div className="text-center">
            <div className="text-4xl font-extrabold mb-1 tabular-nums">
                {formatNumber(count)}{suffix}
            </div>
            <div className="text-white/80 text-sm font-medium uppercase tracking-wider">
                {label}
            </div>
        </div>
    );
};

export function StatisticsSection() {
    const { t } = useTranslation('home');
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/search/stats`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json) => {
                setStats(json.data);
            })
            .catch(() => {
                // Stats section degrades gracefully — shows 0s
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <section className="py-12 bg-primary text-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <Counter
                        end={stats?.totalListings || 0}
                        label={t('statistics.activeListings', { defaultValue: 'CARS AVAILABLE' })}
                        isLoading={isLoading}
                    />
                    <Counter
                        end={stats?.totalMakes || 0}
                        label={t('statistics.carBrands', { defaultValue: 'CAR BRANDS' })}
                        isLoading={isLoading}
                    />
                    <Counter
                        end={stats?.totalModels || 0}
                        label={t('statistics.totalModels', { defaultValue: 'MODELS' })}
                        isLoading={isLoading}
                    />
                    <Counter
                        end={stats?.totalLocations || 0}
                        label={t('statistics.totalLocations', { defaultValue: 'LOCATIONS' })}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </section>
    );
}
