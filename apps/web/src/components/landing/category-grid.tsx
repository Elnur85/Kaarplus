"use client";

import { CarFront, Truck, Bus, Car, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/constants";

interface BodyTypeCount {
    bodyType: string;
    count: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Sedan': CarFront,
    'SUV': Car,
    'Coupe': CarFront,
    'Wagon': CarFront,
    'Hatchback': CarFront,
    'Convertible': CarFront,
    'Minivan': Bus,
    'Pickup': Truck,
};

// Estonian translations for body types
const bodyTypeTranslations: Record<string, string> = {
    'Sedan': 'Sedaan',
    'SUV': 'Maastur',
    'Coupe': 'Kupee',
    'Wagon': 'Universaal',
    'Hatchback': 'Luukpära',
    'Convertible': 'Kabriolett',
    'Minivan': 'Mahtuniversaal',
    'Pickup': 'Pikap',
};

export function CategoryGrid() {
    const { t } = useTranslation('home');
    const [bodyTypes, setBodyTypes] = useState<BodyTypeCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/listings/metadata/body-types`)
            .then((res) => res.json())
            .then((json) => {
                setBodyTypes(json.data || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <section className="py-16 bg-white dark:bg-background/50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-10 text-center">{t('categories.gridTitle')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse">
                                <div className="h-9 w-9 bg-slate-200 rounded mb-3" />
                                <div className="h-4 w-16 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (bodyTypes.length === 0) {
        return null;
    }

    // Take top 8 body types by count
    const topBodyTypes = bodyTypes.slice(0, 8);

    return (
        <section className="py-16 bg-white dark:bg-background/50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-10 text-center">{t('categories.gridTitle')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {topBodyTypes.map((item, index) => {
                        const IconComponent = iconMap[item.bodyType] || CarFront;
                        const displayName = bodyTypeTranslations[item.bodyType] || item.bodyType;
                        
                        return (
                            <Link
                                key={index}
                                href={`/listings?bodyType=${encodeURIComponent(item.bodyType)}`}
                                className="group flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-primary/10 hover:-translate-y-1 transition-all duration-300"
                            >
                                <IconComponent className="h-9 w-9 text-slate-400 group-hover:text-primary mb-3 transition-colors" />
                                <span className="font-semibold text-sm transition-colors group-hover:text-primary text-center">
                                    {displayName}
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {item.count} {t('categories.vehicles', { defaultValue: 'autot' })}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
