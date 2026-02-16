"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export function PopularBrands() {
    const { t } = useTranslation('home');
    const brands = [
        { name: "BMW", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg" },
        { name: "Mercedes-Benz", logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Benz_Logo_2010.svg" },
        { name: "Audi", logo: "https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg" },
        { name: "Volkswagen", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg" },
        { name: "Toyota", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_car_logo.svg" },
        { name: "Volvo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Volvo_logo.svg" },
        { name: "Tesla", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg" },
        { name: "Porsche", logo: "https://upload.wikimedia.org/wikipedia/commons/d/df/Porsche_logo.svg" },
        { name: "Skoda", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Skoda_logo_2022.svg" },
        { name: "Ford", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg" },
        { name: "Hyundai", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg" },
        { name: "Kia", logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/Kia_logo_2021.svg" },
    ];

    return (
        <section className="py-16 border-y border-slate-200 dark:border-primary/10">
            <div className="container mx-auto px-4">
                <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-10">
                    {t('popularBrands.centeredTitle', { defaultValue: 'POPULAARSED MARGID EESTIS' })}
                </h3>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-10 items-center justify-items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {brands.map((brand) => (
                        <Link
                            key={brand.name}
                            href={`/listings?make=${brand.name.toLowerCase()}`}
                            className="hover:scale-110 transition-transform duration-300"
                        >
                            <div className="relative h-10 w-24">
                                <Image
                                    src={brand.logo}
                                    alt={brand.name}
                                    fill
                                    className="object-contain"
                                    sizes="96px"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
