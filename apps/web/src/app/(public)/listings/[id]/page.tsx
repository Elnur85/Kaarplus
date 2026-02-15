import { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { MapPin, Clock, Eye } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";
import { generateVehicleJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

interface Props {
    params: Promise<{ id: string }>;
}

async function getListing(id: string): Promise<ListingDetailed | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`, {
            next: { revalidate: 60 }, // Cache for 60 seconds
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("Failed to fetch listing:", error);
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const listing = await getListing(id);
    if (!listing) return { title: "Kuulutust ei leitud | Kaarplus" };

    const priceFormatted = new Intl.NumberFormat("et-EE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    }).format(listing.price);

    return {
        title: `${listing.year} ${listing.make} ${listing.model} - ${priceFormatted} | Kaarplus`,
        description: `${listing.mileage.toLocaleString()} km, ${listing.fuelType}, ${listing.transmission}. Vaata lähemalt!`,
        openGraph: {
            images: listing.images[0]?.url ? [listing.images[0].url] : [],
        },
    };
}

export default async function CarDetailPage({ params }: Props) {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) {
        notFound();
    }

    const breadcrumbItems = [
        { label: "Kasutatud autod", href: "/listings" },
        { label: listing.make, href: `/listings?make=${listing.make}` },
        { label: `${listing.model} ${listing.year}` },
    ];

    const vehicleJsonLd = generateVehicleJsonLd({
        ...listing,
        price: Number(listing.price),
    });

    const breadcrumbJsonLd = generateBreadcrumbJsonLd([
        { name: "Avaleht", item: SITE_URL },
        { name: "Kasutatud autod", item: `${SITE_URL}/listings` },
        { name: listing.make, item: `${SITE_URL}/listings?make=${listing.make}` },
        { name: `${listing.model} ${listing.year}`, item: `${SITE_URL}/listings/${listing.id}` },
    ]);

    return (
        <div className="container py-8 min-h-screen">
            <JsonLd data={vehicleJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {listing.year} {listing.make} {listing.model}
                        </h1>
                        {listing.verifiedAt && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">
                                Kontrollitud
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-primary" />
                            <span>{listing.location}, Eesti</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye size={16} className="text-slate-400" />
                            <span>{listing.viewCount} vaatamist</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Gallery and Details */}
                <div className="lg:col-span-2 space-y-8">
                    <ImageGallery images={listing.images} />

                    <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <Tabs defaultValue="specs" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b h-14 bg-muted/30 px-6 gap-6">
                                <TabsTrigger
                                    value="specs"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full px-0 font-bold"
                                >
                                    Tehnilised andmed
                                </TabsTrigger>
                                <TabsTrigger
                                    value="description"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full px-0 font-bold"
                                >
                                    Kirjeldus
                                </TabsTrigger>
                                <TabsTrigger
                                    value="features"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full px-0 font-bold"
                                >
                                    Varustus
                                </TabsTrigger>
                            </TabsList>
                            <div className="p-8">
                                <TabsContent value="specs" className="mt-0">
                                    <SpecsGrid listing={listing} />
                                </TabsContent>
                                <TabsContent value="description" className="mt-0">
                                    <div className="prose prose-slate max-w-none">
                                        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                            {listing.description || "Kirjeldus puudub."}
                                        </p>
                                    </div>
                                </TabsContent>
                                <TabsContent value="features" className="mt-0">
                                    <FeatureBadges features={listing.features} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </section>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <PriceCard
                            price={Number(listing.price)}
                            includeVat={listing.priceVatIncluded}
                            isFavorited={listing.isFavorited}
                        />
                        <SellerInfo
                            seller={listing.user}
                            location={listing.location}
                        />

                        <div className="flex items-center justify-center gap-8 p-4 bg-muted/30 rounded-xl border border-dashed">
                            <div className="text-center">
                                <div className="font-bold text-primary text-xl">100%</div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Turvaline</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-primary text-xl">24h</div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Klienditugi</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RelatedCars listingId={listing.id} />
        </div>
    );
}
