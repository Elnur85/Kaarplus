"use client";

import { VehicleSummary } from "@/types/vehicle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ArrowRight, MapPin, Camera, Clock, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PriceDisplay } from "@/components/shared/price-display";
import { SpecIcons } from "@/components/shared/spec-icons";
import { formatDistanceToNow } from "date-fns";
import { et } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface VehicleCardProps {
    vehicle: VehicleSummary;
    variant?: "grid" | "list";
    showFavorite?: boolean;
}

export function VehicleCard({ vehicle, variant = "grid", showFavorite = true }: VehicleCardProps) {
    const { t } = useTranslation(['common', 'listings']);
    const isGrid = variant === "grid";
    const timeAgo = formatDistanceToNow(new Date(vehicle.createdAt), { addSuffix: true, locale: et });

    return (
        <Card className={cn(
            "group relative overflow-hidden flex transition-all duration-300 border border-slate-200 dark:border-slate-800",
            isGrid ? "flex-col h-full bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none rounded-xl" : "flex-col md:flex-row hover:shadow-lg rounded-xl"
        )}>
            {/* status badges helper */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                {vehicle.status === "SOLD" && (
                    <Badge variant="destructive" className="uppercase text-[10px] font-bold px-2 py-1 rounded tracking-wider shadow-sm">
                        {t('common:status.sold', { defaultValue: 'Müüdud' })}
                    </Badge>
                )}
                {vehicle.badges?.map((badge) => (
                    <Badge
                        key={badge}
                        className={cn(
                            "uppercase text-[10px] font-bold px-2 py-1 rounded tracking-wider shadow-sm border-none",
                            badge === "hot_deal" ? "bg-orange-500 text-white" :
                                badge === "new" ? "bg-primary text-white" :
                                    badge === "certified" ? "bg-blue-500 text-white" : "bg-primary text-white"
                        )}
                    >
                        {badge === "hot_deal" ? t('listings:badges.hotDeal', { defaultValue: 'TASUV DIIL' }) :
                            badge === "new" ? t('listings:badges.new', { defaultValue: 'UUS' }) :
                                badge === "certified" ? t('listings:badges.certified', { defaultValue: 'KONTROLLITUD' }) : badge.replace("_", " ")}
                    </Badge>
                ))}
            </div>

            {/* Favorite Button */}
            {showFavorite && (
                <button
                    className={cn(
                        "absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/90 backdrop-blur-sm shadow-md",
                        vehicle.isFavorited ? "text-red-500" : "text-slate-400 hover:text-red-500"
                    )}
                >
                    <Heart size={18} className={vehicle.isFavorited ? "fill-current" : ""} />
                </button>
            )}

            {/* Image Container */}
            <div className={cn(
                "relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0",
                isGrid ? "aspect-square w-full" : "w-full md:w-[320px] aspect-[4/3] md:aspect-auto"
            )}>
                <Image
                    src={vehicle.thumbnailUrl || "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop"}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes={isGrid
                        ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        : "(max-width: 768px) 100vw, 320px"
                    }
                />
            </div>

            {/* Content Container */}
            <div className={cn(
                "flex flex-col flex-1 p-5",
                !isGrid && "min-w-0"
            )}>
                <div className="flex justify-between items-start gap-4 mb-1">
                    <div className="min-w-0">
                        <Link href={`/listings/${vehicle.id}`}>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-primary transition-colors truncate mb-0.5">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{vehicle.variant || "—"}</p>
                    </div>
                </div>

                {/* Specs with icons */}
                <div className={cn(
                    "py-3 border-y border-slate-100 dark:border-slate-800 my-4",
                    !isGrid && "mb-4"
                )}>
                    <SpecIcons
                        mileage={vehicle.mileage}
                        fuelType={vehicle.fuelType}
                        transmission={vehicle.transmission}
                        compact={isGrid}
                    />
                </div>

                {/* List View Description - only in list variant */}
                {!isGrid && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 hidden md:block leading-relaxed">
                        {t('listings:noDescription', { defaultValue: 'Suurepärases tehnilises ja visuaalses seisukorras sõiduk. Hooldusajalugu kontrollitud.' })}
                    </p>
                )}

                {/* Footer Actions */}
                <div className="mt-auto flex items-center justify-between gap-4">
                    {isGrid ? (
                        <>
                            <PriceDisplay
                                price={vehicle.price}
                                includeVat={false}
                                size="lg"
                                variant="slate"
                                className="text-2xl font-black"
                            />
                            <Link
                                href={`/listings/${vehicle.id}`}
                                className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                            >
                                {t('common:details', { defaultValue: 'Detailid' })} <ChevronRight size={16} />
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <MapPin size={14} className="text-slate-400" />
                                    <span>Tallinn, Eesti</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <Clock size={14} className="text-slate-400" />
                                    <span>{timeAgo}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="hidden sm:inline-flex px-6 font-bold rounded-lg border-slate-200 dark:border-slate-700">
                                    {t('common:buttons.save', { defaultValue: 'Salvesta' })}
                                </Button>
                                <Button size="sm" className="px-6 font-bold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg shadow-primary/20 transition-all">
                                    {t('common:buttons.contact', { defaultValue: 'Võta ühendust' })}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}
