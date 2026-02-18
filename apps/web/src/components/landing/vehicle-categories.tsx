
import { VehicleCategoriesClient } from "./vehicle-categories-client";

export async function VehicleCategories() {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

	try {
		const [newestData, electricData, hybridData] = await Promise.all([
			fetch(`${baseUrl}/api/listings/metadata/featured?category=newest&limit=8`, { next: { revalidate: 60 } }).then(r => r.json()),
			fetch(`${baseUrl}/api/listings/metadata/featured?category=electric&limit=8`, { next: { revalidate: 60 } }).then(r => r.json()),
			fetch(`${baseUrl}/api/listings/metadata/featured?category=hybrid&limit=8`, { next: { revalidate: 60 } }).then(r => r.json()),
		]);

		const safeActiveListings = newestData?.data ? newestData.data : [];
		const safeElectricListings = electricData?.data ? electricData.data : [];
		const safeHybridListings = hybridData?.data ? hybridData.data : [];

		return (
			<VehicleCategoriesClient
				activeListings={safeActiveListings}
				electricListings={safeElectricListings}
				hybridListings={safeHybridListings}
			/>
		);
	} catch (error) {
		console.error("Failed to fetch featured vehicles:", error);
		return (
			<VehicleCategoriesClient
				activeListings={[]}
				electricListings={[]}
				hybridListings={[]}
			/>
		);
	}
}
