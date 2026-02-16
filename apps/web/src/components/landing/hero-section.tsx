"use client";

import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/shared/search-bar";
import Image from "next/image";

export function HeroSection() {
    const { t } = useTranslation('home');

    return (
        <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2560&auto=format&fit=crop"
                    alt="Luxury car background"
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/40 z-10" />
            </div>

            <div className="container relative z-20 px-4 flex flex-col items-center">
                <div className="max-w-4xl mx-auto text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                        {t('hero.title')}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {t('hero.subtitle')}
                    </p>
                </div>

                <div className="w-full max-w-5xl">
                    <SearchBar />
                </div>
            </div>
        </section>
    );
}
