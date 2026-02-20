"use client";

import { CarFront, Truck, Bus, Car } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface BodyTypeCount {
	bodyType: string;
	count: number;
}

interface CategoryGridClientProps {
	initialBodyTypes: BodyTypeCount[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	'passengerCar:sedan': CarFront,
	'suv:touring': Car,
	'passengerCar:coupe': CarFront,
	'suv:coupe': Car,
	'passengerCar:touring': CarFront,
	'passengerCar:hatchback': CarFront,
	'passengerCar:cabriolet': CarFront,
	'passengerCar:minivan': Bus,
	'passengerCar:pickup': Truck,
	'commercialVehicle:commercial': Truck,
};

const bodyTypeTranslations: Record<string, string> = {
	'passengerCar:sedan': 'Sedaan',
	'suv:touring': 'Maastur',
	'passengerCar:coupe': 'Kupee',
	'suv:coupe': 'SUV Kupee',
	'passengerCar:touring': 'Universaal',
	'passengerCar:hatchback': 'Luukpära',
	'passengerCar:cabriolet': 'Kabriolett',
	'passengerCar:minivan': 'Mahtuniversaal',
	'passengerCar:pickup': 'Pikap',
	'commercialVehicle:commercial': 'Kaubik',
};

export function CategoryGridClient({ initialBodyTypes }: CategoryGridClientProps) {
	const { t } = useTranslation('home');

	// If no data, return null (or could show skeleton if we were loading, but this is SRR/SSR data now)
	if (initialBodyTypes.length === 0) {
		return null;
	}

	// Take top 8 body types by count
	const topBodyTypes = initialBodyTypes.slice(0, 8);

	return (
		<section className="py-16 bg-white dark:bg-background/50">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold mb-10 text-center">{t('categories.gridTitle')}</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
					{topBodyTypes.map((item, index) => {
						const IconComponent = iconMap[item.bodyType] || CarFront;
						const displayName = bodyTypeTranslations[item.bodyType] || item.bodyType;

						return (
							<Link
								key={index}
								href={`/listings?bodyType=${encodeURIComponent(item.bodyType)}`}
								className="group flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-primary/10 hover:-translate-y-1 transition-all duration-300"
							>
								<IconComponent className="h-9 w-9 text-slate-400 group-hover:text-primary mb-3 transition-colors" />
								<span className="font-semibold text-sm transition-colors group-hover:text-primary text-center">
									{displayName}
								</span>
								<span className="text-xs text-muted-foreground mt-1">
									{item.count} {t('categories.vehicles', { defaultValue: 'autot' })}
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
