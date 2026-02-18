import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailed } from "@/types/listing";
import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";
import { InactiveListing } from "@/components/checkout/inactive-listing";
import checkoutEt from "@/../messages/et/checkout.json";

interface Props {
    params: Promise<{ id: string }>;
}

async function getListing(id: string): Promise<ListingDetailed | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`, {
            cache: "no-store", // Don't cache for purchase page
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("Failed to fetch listing:", error);
        return null;
    }
}

export const metadata: Metadata = {
    title: `${checkoutEt.page.title} | Kaarplus`,
    robots: { index: false, follow: false },
};

export default async function PurchasePage({ params }: Props) {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) {
        notFound();
    }

    if (listing.status !== "ACTIVE") {
        return <InactiveListing />;
    }

    return <CheckoutPageClient listing={listing} />;
}
