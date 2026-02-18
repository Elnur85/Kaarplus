
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
		const apiUrl = process.env.NEXT_PUBLIC_API_URL;
		if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is missing");

		const res = await fetch(`${apiUrl}/api/listings/${id}`, {
			cache: "no-store", // Don't cache for purchase page
		});

		if (!res.ok) {
			console.error(`[PurchasePage] Fetch failed with status ${res.status}`);
			return null;
		}

		const json = await res.json();
		return json.data;
	} catch (error) {
		console.error("[PurchasePage] Failed to fetch listing:", error);
		return null; // This will trigger notFound() via !listing check
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
		// console.error(`[PurchasePage] Listing ${id} not found or fetch failed. Calling notFound()`);
		notFound();
	}

	if (listing.status !== "ACTIVE") {
		return <InactiveListing />;
	}

	return <CheckoutPageClient listing={listing} />;
}
