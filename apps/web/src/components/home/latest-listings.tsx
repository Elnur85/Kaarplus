"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Loader2 } from "lucide-react";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { ListingSection } from "./listing-section";
import { VehicleSummary } from "@/types/vehicle";
import { API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

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
		role: "USER" | "DEALERSHIP" | "ADMIN" | "SUPPORT";
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
		isSponsored: listing.isSponsored,
		createdAt: listing.createdAt,
		location: listing.location,
		user: listing.user,
	};
}

export function LatestListings() {
	const { t } = useTranslation("home");
	const [listings, setListings] = useState<VehicleSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchListings = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(`${API_URL}/search?pageSize=8&sort=newest`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const json = await res.json();
			const apiListings: ApiListing[] = json.data || [];
			setListings(apiListings.map(mapApiToVehicleSummary));
		} catch (err) {
			setError(t("listings.error"));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchListings();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isLoading) {
		return (
			<div className="py-12">
				<div className="flex items-center justify-center gap-2 text-muted-foreground">
					<Loader2 className="size-5 animate-spin" />
					<span>{t("listings.latest")}</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="py-12">
				<div className="flex flex-col items-center justify-center gap-3 text-center">
					<div className="flex items-center gap-2 text-destructive">
						<AlertCircle className="size-5" />
						<span>{error}</span>
					</div>
					<Button variant="outline" size="sm" onClick={fetchListings}>
						{t("listings.retry")}
					</Button>
				</div>
			</div>
		);
	}

	if (listings.length === 0) return null;

	return (
		<ListingSection title={t("listings.latest")} href="/listings?sort=createdAt_desc">
			{listings.map(vehicle => (
				<VehicleCard key={vehicle.id} vehicle={vehicle} variant="grid" />
			))}
		</ListingSection>
	);
}
