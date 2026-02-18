"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface Brand {
	name: string;
	logo: string;
	count: number;
}

interface PopularBrandsClientProps {
	initialBrands: Brand[];
}

export function PopularBrandsClient({ initialBrands }: PopularBrandsClientProps) {
	const { t } = useTranslation('home');

	if (initialBrands.length === 0) {
		return null;
	}

	return (
		<section className="py-16 border-y border-slate-200 dark:border-primary/10">
			<div className="container mx-auto px-4">
				<h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-10">
					{t('popularBrands.centeredTitle', { defaultValue: 'POPULAARSED MARGID EESTIS' })}
				</h3>

				<div className="grid grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-10 items-center justify-items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
					{initialBrands.map((brand) => (
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
