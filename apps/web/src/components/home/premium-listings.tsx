"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { ListingSection } from "./listing-section";
import { VehicleSummary } from "@/types/vehicle";
import { API_URL } from "@/lib/constants";

// API returns images array, but VehicleSummary expects thumbnailUrl
interface ApiListing {
	id: string;
	make: string;
	model: string;
	variant?: string;
	year: number;
	price: number;
	priceVatIncluded: boolean;
	mileage: number;
	fuelType: string;
	transmission: string;
	powerKw?: number;
	bodyType: string;
	status: "ACTIVE" | "PENDING" | "SOLD" | "REJECTED" | "EXPIRED";
	badges?: Array<"new" | "hot_deal" | "certified" | "verified">;
	isFavorited?: boolean;
	isSponsored?: boolean;
	createdAt: string;
	location?: string;
	images?: { url: string }[];
	user?: {
		name: string | null;
		role: "BUYER" | "INDIVIDUAL_SELLER" | "DEALERSHIP" | "ADMIN" | "SUPPORT";
		dealershipId: string | null;
	};
}

function mapApiToVehicleSummary(listing: ApiListing): VehicleSummary {
	return {
		id: listing.id,
		make: listing.make,
		model: listing.model,
		variant: listing.variant,
		year: listing.year,
		price: listing.price,
		priceVatIncluded: listing.priceVatIncluded,
		mileage: listing.mileage,
		fuelType: listing.fuelType,
		transmission: listing.transmission,
		powerKw: listing.powerKw,
		bodyType: listing.bodyType,
		thumbnailUrl: listing.images?.[0]?.url ?? "",
		status: listing.status,
		badges: listing.badges,
		isFavorited: listing.isFavorited,
		isSponsored: listing.isSponsored ?? false,
		createdAt: listing.createdAt,
		location: listing.location,
		user: listing.user,
	};
}

export function PremiumListings() {
	const { t } = useTranslation("home");
	const [listings, setListings] = useState<VehicleSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetch(`${API_URL}/search?pageSize=8&sort=price_desc`)
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json();
			})
			.then((json) => {
				const apiListings: ApiListing[] = json.data || [];
				setListings(apiListings.map(mapApiToVehicleSummary));
			})
			.catch(() => {
				// Non-critical section — silently degrade by showing nothing
			})
			.finally(() => setIsLoading(false));
	}, []);

	if (isLoading || listings.length === 0) return null;

	return (
		<ListingSection 
			title={t("listings.premium")} 
			href="/listings?sort=price_desc" 
			className="bg-slate-50 dark:bg-slate-900/50"
		>
			{listings.map(vehicle => (
				<VehicleCard key={vehicle.id} vehicle={vehicle} variant="grid" />
			))}
		</ListingSection>
	);
}
