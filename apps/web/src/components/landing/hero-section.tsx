"use client";

import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/shared/search-bar";
import { StarRating } from "@/components/shared/star-rating";

import Image from "next/image";

export function HeroSection() {
    const { t } = useTranslation('home');

    return (
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-[#10221c] to-[#0d1a16] text-white overflow-hidden">
            {/* Background Image Optimized for LCP */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Image
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2560&auto=format&fit=crop"
                    alt="Luxury car background"
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                />
            </div>

            <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-8">
                <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium bg-white/10 backdrop-blur-sm py-1 px-3 rounded-full w-fit mx-auto border border-white/20">
                        <StarRating rating={4.9} count={1245} size="sm" showCount={false} />
                        <span className="text-white">4.9/5 kliendirahulolu</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70">
                        {t('hero.title')}
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                        {t('hero.subtitle')}
                    </p>
                </div>

                <div className="w-full max-w-5xl">
                    <SearchBar />
                </div>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-400 pt-4">
                    <span className="flex items-center gap-2">
                        ✅ {t('features.verified.title')}
                    </span>
                    <span className="flex items-center gap-2">
                        ✅ {t('features.secure.title')}
                    </span>
                    <span className="flex items-center gap-2">
                        ✅ {t('features.support.title')}
                    </span>
                </div>
            </div>
        </section>
    );
}
