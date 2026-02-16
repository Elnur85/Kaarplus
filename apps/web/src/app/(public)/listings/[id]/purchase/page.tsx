import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailed } from "@/types/listing";
import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";

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
    title: "Osta sõiduk | Kaarplus",
    robots: { index: false, follow: false },
};

export default async function PurchasePage({ params }: Props) {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) {
        notFound();
    }

    if (listing.status !== "ACTIVE") {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">See kuulutus pole enam aktiivne</h1>
                <p className="text-muted-foreground">Vabandame, aga seda sõidukit ei saa enam osta.</p>
            </div>
        );
    }

    return <CheckoutPageClient listing={listing} />;
}
