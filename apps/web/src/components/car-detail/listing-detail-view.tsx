"use client";

import { ListingDetailed } from "@/types/listing";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ImageGallery } from "@/components/car-detail/image-gallery";
import { PriceCard } from "@/components/car-detail/price-card";
import { SellerInfo } from "@/components/car-detail/seller-info";
import { SpecsGrid } from "@/components/car-detail/specs-grid";
import { FeatureBadges } from "@/components/car-detail/feature-badges";
import { RelatedCars } from "@/components/car-detail/related-cars";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, ShieldCheck, Mail, Phone, ChevronRight, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RequestInspectionButton } from "@/components/inspections/request-inspection-button";
import { SellerReviewsSection } from "@/components/reviews/seller-reviews-section";

interface ListingDetailViewProps {
    listing: ListingDetailed;
}

export function ListingDetailView({ listing }: ListingDetailViewProps) {
    const { t, i18n } = useTranslation(['carDetail', 'listings', 'common']);

    const breadcrumbItems = [
        { label: t('breadcrumb.cars', { ns: 'listings', defaultValue: "Kasutatud autod" }), href: "/listings" },
        { label: listing.make, href: `/listings?make=${listing.make}` },
        { label: `${listing.model} ${listing.year}` },
    ];

    return (
        <div className="container py-8 min-h-screen">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {listing.year} {listing.make} {listing.model}
                        </h1>
                        {listing.verifiedAt && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">
                                {t('specs.verified', { defaultValue: "Kontrollitud" })}
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-primary" />
                            <span>{t('seller.locationEstonia', { location: listing.location })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye size={16} className="text-slate-400" />
                            <span>{t('specs.views', { count: listing.viewCount, defaultValue: `${listing.viewCount} vaatamist` })}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Gallery and Details */}
                <div className="lg:col-span-2 space-y-8">
                    <ImageGallery images={listing.images} />

                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <Tabs defaultValue="specs" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b border-slate-200 dark:border-slate-800 h-14 bg-slate-50/50 dark:bg-slate-900/60 px-6 gap-6">
                                <TabsTrigger
                                    value="specs"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full px-0 font-bold"
                                >
                                    {t('specs.title', { defaultValue: "Tehnilised andmed" })}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="description"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full px-0 font-bold"
                                >
                                    {t('description.title', { defaultValue: "Kirjeldus" })}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="features"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full px-0 font-bold"
                                >
                                    {t('features.title', { defaultValue: "Varustus" })}
                                </TabsTrigger>
                            </TabsList>
                            <div className="p-8">
                                <TabsContent value="specs" className="mt-0">
                                    <SpecsGrid listing={listing} />
                                </TabsContent>
                                <TabsContent value="description" className="mt-0">
                                    <div className="prose prose-slate max-w-none">
                                        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                            {listing.description || t('description.none', { defaultValue: "Kirjeldus puudub." })}
                                        </p>
                                    </div>
                                </TabsContent>
                                <TabsContent value="features" className="mt-0">
                                    <FeatureBadges features={listing.features} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </section>

                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
                        <SellerReviewsSection
                            sellerId={listing.user.id}
                            sellerName={listing.user.name || t('seller.privateSeller')}
                        />
                    </section>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <PriceCard
                            listingId={listing.id}
                            price={Number(listing.price)}
                            includeVat={listing.priceVatIncluded}
                            isFavorited={listing.isFavorited}
                        />
                        <SellerInfo
                            seller={listing.user}
                            location={listing.location}
                        />

                        <RequestInspectionButton
                            listingId={listing.id}
                            listingTitle={`${listing.year} ${listing.make} ${listing.model}`}
                        />

                        <div className="flex items-center justify-center gap-6 p-4">
                            <div className="flex flex-col items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                                <ShieldCheck className="h-8 w-8 mb-1 text-slate-700 dark:text-white" />
                                <span className="text-[10px] font-bold dark:text-white">100% {t('seller.history')}</span>
                            </div>
                            <div className="flex flex-col items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                                <Star className="h-8 w-8 mb-1 text-slate-700 dark:text-white" />
                                <span className="text-[10px] font-bold dark:text-white">24h {t('features.support.title', { ns: 'home', defaultValue: 'Klienditugi' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RelatedCars listingId={listing.id} />
        </div>
    );
}
