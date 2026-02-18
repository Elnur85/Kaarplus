
import { CategoryGridClient } from "./category-grid-client";

export async function CategoryGrid() {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
	let bodyTypes = [];

	try {
		const res = await fetch(`${baseUrl}/api/listings/metadata/body-types`, {
			next: { revalidate: 3600 } // Cache for 1 hour
		});

		if (res.ok) {
			const json = await res.json();
			bodyTypes = json.data || [];
		}
	} catch (error) {
		console.error("Failed to fetch body types:", error);
	}

	return <CategoryGridClient initialBodyTypes={bodyTypes} />;
}
