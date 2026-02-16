"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Check,
    X,
    User,
    Calendar,
    Gauge,
    Fuel,
    Settings as SettingsIcon,
    MapPin,
    ExternalLink,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/shared/price-display";
import { format } from "date-fns";
import { et, ru, enGB } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface ListingReviewCardProps {
    listing: any;
    onApprove: (id: string) => void;
    onReject: (id: string, title: string) => void;
}

export function ListingReviewCard({ listing, onApprove, onReject }: ListingReviewCardProps) {
    const { t, i18n } = useTranslation('admin');
    const [isExpanded, setIsExpanded] = useState(false);

    const title = `${listing.make} ${listing.model} ${listing.variant || ""}`;
    const currentLocale = i18n.language === 'ru' ? ru : i18n.language === 'en' ? enGB : et;

    return (
        <Card className="overflow-hidden border-border/50 shadow-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-0">
                {/* Summary Row */}
                <div className="flex flex-col md:flex-row items-center p-4 gap-6">
                    <div className="relative w-full md:w-40 aspect-video rounded-lg overflow-hidden border border-border shrink-0">
                        {listing.images?.[0] ? (
                            <Image
                                src={listing.images[0].url}
                                alt={title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Gauge size={32} />
                            </div>
                        )}
                        <Badge className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm border-none">
                            {t('queue.card.photoCount', { count: listing.images?.length || 0 })}
                        </Badge>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg truncate">{title}</h3>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                                {listing.bodyType}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <User size={14} />
                                <span className="truncate max-w-[150px]">{listing.user?.name || t('queue.card.user')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{format(new Date(listing.createdAt), "d. MMMM yyyy", { locale: currentLocale })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>{listing.location}</span>
                            </div>
                        </div>

                        <div className="pt-1">
                            <PriceDisplay price={Number(listing.price)} includeVat={listing.priceVatIncluded} size="sm" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {isExpanded ? t('queue.card.showLess') : t('queue.card.showMore')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                            onClick={() => onReject(listing.id, title)}
                        >
                            <X size={16} className="mr-2" /> {t('queue.card.reject')}
                        </Button>
                        <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white"
                            onClick={() => onApprove(listing.id)}
                        >
                            <Check size={16} className="mr-2" /> {t('queue.card.approve')}
                        </Button>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-border/50 bg-slate-50/50 space-y-6 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t('queue.card.sections.specs')}</p>
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Gauge size={16} className="text-muted-foreground" />
                                        <span>{listing.mileage.toLocaleString()} km</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Fuel size={16} className="text-muted-foreground" />
                                        <span>{listing.fuelType}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <SettingsIcon size={16} className="text-muted-foreground" />
                                        <span>{listing.transmission}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar size={16} className="text-muted-foreground" />
                                        <span>{listing.year}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t('queue.card.sections.description')}</p>
                                <p className="text-sm pt-2 leading-relaxed">
                                    {listing.description || t('queue.card.noDescription')}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t('queue.card.sections.vin')}</p>
                                <div className="pt-2">
                                    <code className="bg-slate-100 px-2 py-1 rounded text-xs select-all">
                                        {listing.vin || t('queue.card.noVin')}
                                    </code>
                                    <div className="mt-4">
                                        <Button variant="link" size="sm" className="h-auto p-0 text-primary gap-1">
                                            {t('queue.card.checkHistory')} <ExternalLink size={12} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t('queue.card.sections.photos')}</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                {listing.images?.map((img: any, i: number) => (
                                    <div
                                        key={img.id}
                                        className="relative aspect-square rounded-md overflow-hidden border border-border group cursor-zoom-in"
                                    >
                                        <Image
                                            src={img.url}
                                            alt={t('queue.card.photoCount', { count: i + 1 })}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

