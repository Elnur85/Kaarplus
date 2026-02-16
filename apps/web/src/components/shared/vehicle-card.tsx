"use client";

import { VehicleSummary } from "@/types/vehicle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ArrowRight, MapPin, Camera, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PriceDisplay } from "@/components/shared/price-display";
import { SpecIcons } from "@/components/shared/spec-icons";
import { formatDistanceToNow } from "date-fns";
import { et } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
    vehicle: VehicleSummary;
    variant?: "grid" | "list";
    showFavorite?: boolean;
}

export function VehicleCard({ vehicle, variant = "grid", showFavorite = true }: VehicleCardProps) {
    const isGrid = variant === "grid";
    const timeAgo = formatDistanceToNow(new Date(vehicle.createdAt), { addSuffix: true, locale: et });

    return (
        <Card className={cn(
            "group relative overflow-hidden flex transition-all duration-300",
            isGrid ? "flex-col h-full hover:shadow-xl hover:shadow-primary/5" : "flex-col md:flex-row hover:shadow-lg"
        )}>
            {/* status badges helper */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {vehicle.status === "SOLD" && (
                    <Badge variant="destructive" className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 shadow-sm">
                        Müüdud
                    </Badge>
                )}
                {vehicle.badges?.map((badge) => (
                    <Badge
                        key={badge}
                        className={cn(
                            "uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 shadow-sm",
                            badge === "hot_deal" ? "bg-red-500 hover:bg-red-600 text-white" :
                                badge === "new" ? "bg-primary hover:bg-primary/90 text-white" :
                                    badge === "certified" ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-primary text-white"
                        )}
                    >
                        {badge.replace("_", " ")}
                    </Badge>
                ))}

                {vehicle.user?.role === "DEALERSHIP" && (
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 shadow-sm">
                        Pro Seller
                    </Badge>
                )}
            </div>

            {/* Image Container */}
            <div className={cn(
                "relative overflow-hidden bg-muted flex-shrink-0",
                isGrid ? "aspect-[4/3] w-full" : "w-full md:w-[320px] aspect-[4/3] md:aspect-auto"
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

                {showFavorite && (
                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-3 right-3 rounded-full size-8 bg-white/90 backdrop-blur-sm hover:bg-white text-muted-foreground hover:text-red-500 transition-colors shadow-md"
                    >
                        <Heart size={16} className={vehicle.isFavorited ? "fill-red-500 text-red-500" : ""} />
                    </Button>
                )}
            </div>

            {/* Content Container */}
            <div className={cn(
                "flex flex-col flex-1 p-5",
                !isGrid && "min-w-0"
            )}>
                <div className="flex justify-between items-start gap-4 mb-1">
                    <div className="min-w-0">
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors truncate">
                            <Link href={`/listings/${vehicle.id}`}>
                                {vehicle.year} {vehicle.make} {vehicle.model}
                            </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{vehicle.variant || "—"}</p>
                    </div>
                    {!isGrid && (
                        <div className="text-right flex-shrink-0">
                            <PriceDisplay price={vehicle.price} includeVat={vehicle.priceVatIncluded} size="lg" />
                            <p className="text-[10px] text-muted-foreground uppercase mt-0.5">KM-ga</p>
                        </div>
                    )}
                </div>

                {/* Specs with icons */}
                <div className={cn(
                    "py-3 border-y border-border/50 my-3",
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
                    <p className="text-sm text-slate-600 line-clamp-2 mb-6 hidden md:block">
                        Suurepärases tehnilises ja visuaalses seisukorras sõiduk. Hooldusajalugu kontrollitud,
                        eestis arvel ja koheseks sõiduks valmis. Võimalik järelmaks ja vahetus!
                    </p>
                )}

                {/* Footer Actions */}
                <div className="mt-auto flex items-center justify-between gap-4 pt-1">
                    {isGrid ? (
                        <>
                            <PriceDisplay price={vehicle.price} includeVat={vehicle.priceVatIncluded} size="md" />
                            <Link
                                href={`/listings/${vehicle.id}`}
                                className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                            >
                                Detailid <ArrowRight size={14} />
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MapPin size={14} className="text-slate-400" />
                                    <span>Tallinn, Eesti</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock size={14} className="text-slate-400" />
                                    <span>{timeAgo}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="hidden sm:inline-flex px-4 font-bold">Luba</Button>
                                <Button size="sm" className="px-4 font-bold bg-primary hover:bg-primary/90 text-white">Võta ühendust</Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}
