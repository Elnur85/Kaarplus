"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListingImage } from "@/types/listing";

interface ImageGalleryProps {
    images: ListingImage[];
}

import { useTranslation } from "react-i18next";

export function ImageGallery({ images }: ImageGalleryProps) {
    const { t } = useTranslation('carDetail');
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images?.length) {
        return (
            <div className="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">{t('gallery.noImages')}</span>
            </div>
        );
    }

    const next = () => setActiveIndex((prev) => (prev + 1) % images.length);
    const prev = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted group">
                <Image
                    src={images[activeIndex].url}
                    alt={t('gallery.vehicleImage', { index: activeIndex + 1 })}
                    fill
                    className="object-cover transition-transform duration-500"
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                />

                {/* Overlays */}
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm z-10">
                    {t('gallery.photoCount', { current: activeIndex + 1, total: images.length })}
                </div>

                <button
                    className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/80"
                    title={t('gallery.fullscreen')}
                >
                    <Maximize2 size={18} />
                </button>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute inset-y-0 left-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <div className="bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg transition-all">
                                <ChevronLeft size={24} />
                            </div>
                        </button>
                        <button
                            onClick={next}
                            className="absolute inset-y-0 right-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <div className="bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg transition-all">
                                <ChevronRight size={24} />
                            </div>
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {images.map((image, index) => (
                    <button
                        key={image.id}
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                            "relative min-w-[120px] h-20 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0",
                            activeIndex === index
                                ? "ring-2 ring-primary ring-offset-1"
                                : "opacity-60 hover:opacity-100"
                        )}
                    >
                        <Image
                            src={image.url}
                            alt={t('gallery.thumbnail', { index: index + 1 })}
                            fill
                            className="object-cover"
                            sizes="120px"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
