"use client";

import { CarFront, Truck, Bus, Zap, Car } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function CategoryGrid() {
    const { t } = useTranslation('home');
    const categories = [
        { key: "sedan", name: t('categories.grid.sedan'), icon: CarFront, href: "/listings?bodyType=Sedan" },
        { key: "suv", name: t('categories.grid.suv'), icon: Car, href: "/listings?bodyType=SUV" },
        { key: "coupe", name: t('categories.grid.coupe'), icon: CarFront, href: "/listings?bodyType=Coupe" },
        { key: "touring", name: t('categories.grid.touring', { defaultValue: 'Touring' }), icon: CarFront, href: "/listings?bodyType=Touring" },
        { key: "hatchback", name: t('categories.grid.hatchback'), icon: CarFront, href: "/listings?bodyType=Hatchback" },
        { key: "cabriolet", name: t('categories.grid.cabriolet', { defaultValue: 'Cabriolet' }), icon: CarFront, href: "/listings?bodyType=Cabriolet" },
        { key: "van", name: t('categories.grid.van', { defaultValue: 'Van' }), icon: Bus, href: "/listings?bodyType=Van" },
        { key: "pickup", name: t('categories.grid.pickup', { defaultValue: 'Pickup' }), icon: Truck, href: "/listings?bodyType=Pickup" },
    ];

    return (
        <section className="py-16 bg-white dark:bg-background/50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-10 text-center">{t('categories.gridTitle')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((cat, index) => (
                        <Link
                            key={index}
                            href={cat.href}
                            className="group flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-primary/10 hover:-translate-y-1 transition-all duration-300"
                        >
                            <cat.icon className="h-9 w-9 text-slate-400 group-hover:text-primary mb-3 transition-colors" />
                            <span className="font-semibold text-sm transition-colors group-hover:text-primary">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

