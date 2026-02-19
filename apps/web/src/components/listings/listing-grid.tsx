"use client";

import { ListingDetailed } from "@/types/listing";
import { VehicleSummary } from "@/types/vehicle";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ListingGridProps {
	listings: ListingDetailed[];
	isLoading?: boolean;
}

type VehicleUser = NonNullable<VehicleSummary["user"]>;

const DEFAULT_USER: VehicleUser = {
	name: "Unknown Seller",
	role: "USER",
	dealershipId: null,
};

/**
 * Maps a ListingDetailed to VehicleSummary for VehicleCard component
 * This ensures type safety and proper data transformation
 */
function mapToVehicleSummary(listing: ListingDetailed): VehicleSummary {
	// Extract user with fallback
	const user = listing.user;
	const safeUser: VehicleUser = user
		? {
				name: user.name,
				role: user.role as VehicleUser["role"],
				dealershipId: user.dealershipId,
			}
		: DEFAULT_USER;

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
		user: safeUser,
	};
}

export function ListingGrid({ listings, isLoading = false }: ListingGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div key={i} className="space-y-4">
						<Skeleton className="h-48 w-full rounded-xl" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{listings.map((listing) => {
				const summary = mapToVehicleSummary(listing);
				return <VehicleCard key={listing.id} vehicle={summary} />;
			})}
		</div>
	);
}
