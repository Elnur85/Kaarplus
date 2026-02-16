"use client";

import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { et, enUS, ru } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface SpecsGridProps {
    listing: {
        id: string;
        year: number;
        mileage: number;
        fuelType: string;
        transmission: string;
        powerKw: number;
        bodyType: string;
        driveType?: string | null;
        doors?: number | null;
        seats?: number | null;
        colorExterior: string;
        colorInterior?: string | null;
        condition: string;
        vin?: string | null;
        registrationDate?: string | null;
        createdAt: string;
    };
}

export function SpecsGrid({ listing }: SpecsGridProps) {
    const { t, i18n } = useTranslation(['carDetail', 'sell']);
    const currentLocale = i18n.language === 'ru' ? ru : i18n.language === 'en' ? enUS : et;

    const specItems = [
        { label: t('specs.condition'), value: t(`options.condition.${listing.condition}`, { ns: 'sell', defaultValue: listing.condition }) },
        { label: t('specs.firstRegistration'), value: listing.year.toString() },
        { label: t('specs.mileage'), value: `${listing.mileage.toLocaleString(i18n.language === 'et' ? "et-EE" : i18n.language === 'ru' ? "ru-RU" : "en-US")} km` },
        { label: t('specs.engine'), value: t(`options.fuel.${listing.fuelType}`, { ns: 'sell', defaultValue: listing.fuelType }) },
        { label: t('specs.power'), value: `${listing.powerKw} kW (${Math.round(listing.powerKw * 1.341)} hj)` },
        { label: t('specs.transmission'), value: t(`options.transmission.${listing.transmission}`, { ns: 'sell', defaultValue: listing.transmission }) },
        { label: t('specs.driveType'), value: listing.driveType ? t(`options.drive.${listing.driveType}`, { ns: 'sell', defaultValue: listing.driveType }) : t('specs.frontWheelDrive') },
        { label: t('specs.bodyType'), value: t(`step1.types.${listing.bodyType.toLowerCase()}`, { ns: 'sell', defaultValue: listing.bodyType }) },
        { label: t('specs.doorsSeats'), value: `${listing.doors || "—"} / ${listing.seats || "—"}` },
        { label: t('specs.exteriorColor'), value: listing.colorExterior },
        { label: t('specs.interiorColor'), value: listing.colorInterior || "—" },
        { label: t('specs.vin'), value: listing.vin || t('specs.notSpecified'), isUppercase: true },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                {specItems.map((item, index) => (
                    <div key={index} className="flex justify-between py-3.5 border-b border-border/50 last:border-0 md:last:border-b">
                        <span className="text-muted-foreground text-sm font-medium">{item.label}</span>
                        <span className={`font-semibold text-slate-800 ${item.isUppercase ? 'uppercase' : ''}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2">
                <span>
                    {t('specs.addedOn', {
                        date: format(new Date(listing.createdAt), "dd. MMMM yyyy", { locale: currentLocale })
                    })}
                </span>
                <span>ID: {listing.id?.substring(0, 8).toUpperCase()}</span>
            </div>
        </div>
    );
}
