"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListingImage } from "@/types/listing";
import { useTranslation } from "react-i18next";

interface ImageGalleryProps {
    images: ListingImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
    const { t } = useTranslation('carDetail');
    const [activeIndex, setActiveIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(1);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isFullscreen) return;
            
            switch (e.key) {
                case 'Escape':
                    setIsFullscreen(false);
                    break;
                case 'ArrowLeft':
                    prev();
                    break;
                case 'ArrowRight':
                    next();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen, activeIndex, images.length]);

    // Prevent body scroll when fullscreen is open
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    const next = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % images.length);
        setZoom(1);
    }, [images.length]);

    const prev = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
        setZoom(1);
    }, [images.length]);

    const openFullscreen = useCallback(() => {
        setIsFullscreen(true);
        setZoom(1);
    }, []);

    const closeFullscreen = useCallback(() => {
        setIsFullscreen(false);
        setZoom(1);
    }, []);

    const toggleZoom = useCallback(() => {
        setZoom((prev) => (prev === 1 ? 2 : 1));
    }, []);

    if (!images?.length) {
        return (
            <div className="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">{t('gallery.noImages')}</span>
            </div>
        );
    }

    return (
        <>
            {/* Main Gallery */}
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
                        onClick={openFullscreen}
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

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeFullscreen}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeFullscreen}
                        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
                    >
                        <X size={24} />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-4 text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                        {t('gallery.photoCount', { current: activeIndex + 1, total: images.length })}
                    </div>

                    {/* Zoom Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleZoom();
                        }}
                        className="absolute top-4 right-16 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
                    >
                        {zoom === 1 ? <ZoomIn size={24} /> : <ZoomOut size={24} />}
                    </button>

                    {/* Main Fullscreen Image */}
                    <div 
                        className="relative w-full h-full flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={images[activeIndex].url}
                            alt={t('gallery.vehicleImage', { index: activeIndex + 1 })}
                            fill
                            className="object-contain transition-transform duration-300"
                            style={{ transform: `scale(${zoom})` }}
                            sizes="100vw"
                            priority
                        />
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prev();
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    next();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    {/* Thumbnail Strip at Bottom */}
                    <div 
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 bg-black/50 rounded-lg backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                onClick={() => {
                                    setActiveIndex(index);
                                    setZoom(1);
                                }}
                                className={cn(
                                    "relative w-16 h-12 rounded overflow-hidden transition-all flex-shrink-0",
                                    activeIndex === index
                                        ? "ring-2 ring-white"
                                        : "opacity-50 hover:opacity-100"
                                )}
                            >
                                <Image
                                    src={image.url}
                                    alt={t('gallery.thumbnail', { index: index + 1 })}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
