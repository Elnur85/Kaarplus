import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailed } from "@/types/listing";
import { JsonLd } from "@/components/shared/json-ld";
import { generateVehicleJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { ListingDetailView } from "@/components/car-detail/listing-detail-view";

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
    if (!listing) return { title: "Listing not found | Kaarplus" };

    const priceFormatted = new Intl.NumberFormat("et-EE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    }).format(listing.price);

    return {
        title: `${listing.year} ${listing.make} ${listing.model} - ${priceFormatted} | Kaarplus`,
        description: `${listing.mileage.toLocaleString()} km, ${listing.fuelType}, ${listing.transmission}. Check it out!`,
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
        <>
            <JsonLd data={vehicleJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <ListingDetailView listing={listing} />
        </>
    );
}
