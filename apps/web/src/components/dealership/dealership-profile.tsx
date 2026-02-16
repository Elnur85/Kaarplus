"use client";

import Image from "next/image";
import { ListingDetailed } from "@/types/listing";
import { MapPin, Phone, Mail, Globe, Clock, MessageSquare, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingGrid } from "@/components/listings/listing-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";

interface DealershipProfileProps {
    dealership: ListingDetailed['user']; // ListingDetailed includes User fields
    listings: ListingDetailed[];
}

import { useTranslation } from "react-i18next";

export function DealershipProfile({ dealership, listings }: DealershipProfileProps) {
    const { t } = useTranslation('dealership');
    return (
        <div className="container py-8 min-h-screen">
            {/* Cover Image */}
            <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden mb-8 bg-muted">
                {dealership.coverImage ? (
                    <Image
                        src={dealership.coverImage}
                        alt={`${dealership.name} cover`}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center">
                        <Car className="h-24 w-24 text-primary/20" />
                    </div>
                )}

                {/* Logo Overlay */}
                <div className="absolute -bottom-16 left-8 md:left-12">
                    <div className="h-32 w-32 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg relative">
                        {dealership.image ? (
                            <Image
                                src={dealership.image}
                                alt={dealership.name || "Dealership"}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                {dealership.name?.charAt(0) || "D"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Header Info */}
            <div className="mt-20 flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                <div className="space-y-4 max-w-2xl">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold tracking-tight">{dealership.name}</h1>
                            <Badge variant="default" className="bg-primary text-primary-foreground">
                                {t('badges.official')}
                            </Badge>
                        </div>
                        <div className="flex items-center text-muted-foreground gap-2">
                            <MapPin size={16} />
                            <span>{dealership.address || t('placeholders.noLocation')}</span>
                        </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                        {dealership.bio || t('placeholders.noBio')}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        {dealership.website && (
                            <a href={dealership.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                                <Globe size={16} className="text-primary" />
                                {t('links.website')}
                            </a>
                        )}
                        {dealership.phone && (
                            <a href={`tel:${dealership.phone}`} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                                <Phone size={16} className="text-primary" />
                                {dealership.phone}
                            </a>
                        )}
                        {dealership.email && (
                            <a href={`mailto:${dealership.email}`} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                                <Mail size={16} className="text-primary" />
                                {t('links.email')}
                            </a>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-3 min-w-[280px]">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Clock size={16} className="text-primary" />
                            {t('sections.openingHours')}
                        </h3>
                        {dealership.openingHours ? (
                            <p className="text-sm whitespace-pre-line text-muted-foreground">{dealership.openingHours}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">{t('placeholders.noOpeningHours')}</p>
                        )}
                    </div>

                    <Button className="w-full font-bold h-12 gap-2">
                        <MessageSquare size={18} /> {t('buttons.contact')}
                    </Button>
                </div>
            </div>

            {/* Inventory */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{t('inventory.title')}</h2>
                    <Badge variant="outline" className="px-3 py-1">
                        {listings.length === 1 ? t('inventory.count', { count: listings.length }) : t('inventory.count_plural', { count: listings.length })}
                    </Badge>
                </div>

                <ListingGrid listings={listings} isLoading={false} />

                {listings.length === 0 && (
                    <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                        <Car className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium">{t('inventory.empty.title')}</h3>
                        <p className="text-muted-foreground">{t('inventory.empty.description')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

