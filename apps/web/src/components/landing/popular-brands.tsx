"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface Brand {
	name: string;
	logo: string;
	count: number;
}

export function PopularBrands() {
	const { t } = useTranslation('home');
	const [brands, setBrands] = useState<Brand[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Fetch unique makes from active listings
		fetch(`${API_URL}/search/makes`)
			.then((res) => res.json())
			.then((json) => {
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
						count: 0,
					}));

				setBrands(mappedBrands);
			})
			.catch(console.error)
			.finally(() => setIsLoading(false));
	}, []);

	if (isLoading) {
		return (
			<section className="py-16 border-y border-slate-200 dark:border-primary/10">
				<div className="container mx-auto px-4">
					<h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-10">
						{t('popularBrands.centeredTitle', { defaultValue: 'POPULAARSED MARGID EESTIS' })}
					</h3>
					<div className="grid grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-10 items-center justify-items-center">
						{Array.from({ length: 12 }).map((_, i) => (
							<Skeleton key={i} className="h-10 w-24" />
						))}
					</div>
				</div>
			</section>
		);
	}

	if (brands.length === 0) {
		return null;
	}

	return (
		<section className="py-16 border-y border-slate-200 dark:border-primary/10">
			<div className="container mx-auto px-4">
				<h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-10">
					{t('popularBrands.centeredTitle', { defaultValue: 'POPULAARSED MARGID EESTIS' })}
				</h3>

				<div className="grid grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-10 items-center justify-items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
					{brands.map((brand) => (
						<Link
							key={brand.name}
							href={`/listings?make=${encodeURIComponent(brand.name)}`}
							className="hover:scale-110 transition-transform duration-300"
						>
							<div className="relative h-10 w-24">
								<Image
									src={brand.logo}
									alt={brand.name}
									fill
									className="object-contain"
									sizes="96px"
								/>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
