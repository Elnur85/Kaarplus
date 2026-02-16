"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { CompareVehicle, useCompareStore } from "@/store/use-compare-store";

interface CompareVehicleCardProps {
    vehicle: CompareVehicle;
}

import { useTranslation } from "react-i18next";

export function CompareVehicleCard({ vehicle }: CompareVehicleCardProps) {
    const { t } = useTranslation('compare');
    const removeVehicle = useCompareStore((s) => s.removeVehicle);

    return (
        <div className="relative group bg-card p-4 rounded-xl border border-border shadow-sm">
            <button
                onClick={() => removeVehicle(vehicle.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-muted border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shadow-sm z-10"
                aria-label={t('buttons.removeFromCompare')}
            >
                <X size={14} />
            </button>
            <Link href={`/listings/${vehicle.id}`}>
                <div className="w-full h-24 relative rounded overflow-hidden mb-3 bg-muted">
                    {vehicle.imageUrl ? (
                        <Image
                            src={vehicle.imageUrl}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            fill
                            className="object-cover"
                            sizes="200px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            {t('placeholders.noImage')}
                        </div>
                    )}
                </div>
                <h3 className="font-bold text-sm text-foreground line-clamp-1">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-primary font-semibold text-sm">
                    {formatPrice(vehicle.price, vehicle.priceVatIncluded)}
                </p>
            </Link>
        </div>
    );
}
