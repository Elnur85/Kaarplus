import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailed } from "@/types/listing";
import { ListingDetailView } from "@/components/car-detail/listing-detail-view";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbJsonLd, generateVehicleJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import listingsEt from "@/../messages/et/listings.json";

interface Props {
	params: Promise<{ id: string }>;
}

async function getListing(id: string): Promise<ListingDetailed | null> {
	try {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL;
		if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is missing");

		const res = await fetch(`${apiUrl}/api/listings/${id}`, {
			next: { revalidate: 60 },
		});

		if (!res.ok) {
			console.error(`[ListingPage] Fetch failed for id ${id} with status ${res.status}`);
			return null;
		}

		const json = await res.json();
		return json.data;
	} catch (error) {
		console.error(`[ListingPage] Failed to fetch listing ${id}:`, error);
		return null;
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const listing = await getListing(id);

	if (!listing) {
		return {
			title: "Sõidukit ei leitud | Kaarplus",
		};
	}

	const priceFormatted = new Intl.NumberFormat("et-EE", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0,
	}).format(listing.price);

	const title = `${listing.year} ${listing.make} ${listing.model} — ${priceFormatted}`;
	const description = listing.description?.slice(0, 160) || `Müüa ${listing.make} ${listing.model} (${listing.year}) hinnaga ${priceFormatted}. Vaata lähemalt Kaarplus portaalist!`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: listing.images?.[0]?.url ? [listing.images[0].url] : [],
		},
	};
}

export default async function ListingPage({ params }: Props) {
	const { id } = await params;
	const listing = await getListing(id);

	if (!listing) {
		notFound();
	}

	const breadcrumbJsonLd = generateBreadcrumbJsonLd([
		{ name: listingsEt.carsPage.breadcrumb.home, item: SITE_URL },
		{ name: listingsEt.carsPage.breadcrumb.cars, item: `${SITE_URL}/listings` },
		{ name: listing.make, item: `${SITE_URL}/listings?make=${listing.make}` },
		{ name: `${listing.model} ${listing.year}`, item: `${SITE_URL}/listings/${listing.id}` },
	]);

	const vehicleJsonLd = generateVehicleJsonLd(listing);

	return (
		<>
			<JsonLd data={breadcrumbJsonLd} />
			<JsonLd data={vehicleJsonLd} />
			<ListingDetailView listing={listing} />
		</>
	);
}
