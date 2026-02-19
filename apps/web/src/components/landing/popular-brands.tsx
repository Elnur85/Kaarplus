
import { API_URL } from "@/lib/constants";
import { PopularBrandsClient } from "./popular-brands-client";

interface Brand {
	name: string;
	logo: string;
}

export async function PopularBrands() {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
	let brands: Brand[] = [];

	try {
		const res = await fetch(`${baseUrl}/api/search/makes`, {
			next: { revalidate: 3600 } // Cache for 1 hour
		});

		if (res.ok) {
			const json = await res.json();
			const makes = json.data || [];

			// Map makes to brand objects with logos
			const brandLogos: Record<string, string> = {
				'BMW': 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
				'Mercedes-Benz': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Benz_Logo_2010.svg',
				'Audi': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg',
				'Volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg',
				'Toyota': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_car_logo.svg',
				'Volvo': 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Volvo_logo.svg',
				'Tesla': 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg',
				'Porsche': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Porsche_logo.svg',
				'Skoda': 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Skoda_logo_2022.svg',
				'Ford': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg',
				'Hyundai': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg',
				'Kia': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Kia_logo_2021.svg',
				'Lexus': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Lexus_logo_2023.svg',
				'Nissan': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Nissan_2020_logo.svg',
				'Honda': 'https://upload.wikimedia.org/wikipedia/commons/3/38/Honda_logo.svg',
			};

			const mappedBrands = makes
				.filter((make: string) => brandLogos[make])
				.slice(0, 12)
				.map((make: string) => ({
					name: make,
					logo: brandLogos[make],
				}));

			brands = mappedBrands;
		}
	} catch (error) {
		console.error("Failed to fetch popular brands:", error);
	}

	return <PopularBrandsClient initialBrands={brands} />;
}
