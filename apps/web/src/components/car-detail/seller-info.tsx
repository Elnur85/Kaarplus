"use client";

import Link from "next/link";
import { Star, MapPin, ShieldCheck, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

interface SellerInfoProps {
    seller: {
        id: string;
        name: string | null;
        phone: string | null;
        email: string;
        role: string;
        dealershipId?: string | null;
        image?: string | null;
    };
    location: string;
}

export function SellerInfo({ seller, location }: SellerInfoProps) {
    const { t } = useTranslation('carDetail');
    const isDealership = seller.role === "DEALERSHIP";

    // Determine avatar URL
    const avatarUrl = seller.image || `https://ui-avatars.com/api/?name=${seller.name || "User"}&background=random`;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>{t('seller.title')}</span>
                {isDealership && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">{t('seller.dealership')}</span>}
            </h3>

            <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{seller.name?.substring(0, 2).toUpperCase() || "MÜ"}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-bold text-lg leading-tight">
                        {isDealership ? (
                            <Link href={`/dealers/${seller.id}`} className="hover:underline hover:text-primary transition-colors">
                                {seller.name || t('seller.privateSeller')}
                            </Link>
                        ) : (
                            seller.name || t('seller.privateSeller')
                        )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">{isDealership ? t('seller.dealership') : t('seller.privateSeller')}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <ShieldCheck size={16} className="text-primary" />
                    <span>{isDealership ? t('seller.officialPartner') : t('seller.verifiedSeller')}</span>
                </div>
                {/* ... location and phone ... */}
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin size={16} className="text-primary" />
                    <span>{t('seller.locationEstonia', { location })}</span>
                </div>
                {seller.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <Phone size={16} className="text-primary" />
                        <a href={`tel:${seller.phone}`} className="hover:text-primary transition-colors">{seller.phone}</a>
                    </div>
                )}
            </div>

            {isDealership && (
                <Button variant="secondary" className="w-full gap-2 font-bold h-11 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm transition-colors" asChild>
                    <Link href={`/dealers/${seller.id}`}>
                        {t('seller.viewAllListings')} <ChevronRight size={16} />
                    </Link>
                </Button>
            )}

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-help" title={t('seller.history')}>
                    <ShieldCheck size={28} className="text-slate-700" />
                    <span className="text-[9px] font-extrabold uppercase text-center">{t('seller.history')}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-help" title={t('seller.warranty')}>
                    <Star size={28} className="text-slate-700" />
                    <span className="text-[9px] font-extrabold uppercase text-center">{t('seller.warranty')}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-help" title={t('seller.verified')}>
                    <MapPin size={28} className="text-slate-700" />
                    <span className="text-[9px] font-extrabold uppercase text-center">{t('seller.verified')}</span>
                </div>
            </div>
        </div>
    );
}
