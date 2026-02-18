"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { VehicleSummary } from "@/types/vehicle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface VehicleCategoriesClientProps {
	activeListings: VehicleSummary[];
	electricListings: VehicleSummary[];
	hybridListings: VehicleSummary[];
}

export function VehicleCategoriesClient({
	activeListings,
	electricListings,
	hybridListings
}: VehicleCategoriesClientProps) {
	const { t } = useTranslation('home');

	const categories = [
		{ value: "buy", label: t('categories.tabs.buy'), query: "", data: activeListings },
		{ value: "electric", label: t('categories.tabs.electric'), query: "?fuelType=Electric", data: electricListings },
		{ value: "hybrid", label: t('categories.tabs.hybrid'), query: "?fuelType=Hybrid", data: hybridListings },
	];

	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<Tabs defaultValue="buy" className="w-full">
					<div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
						<h2 className="text-3xl font-bold tracking-tight">{t('categories.title')}</h2>
						<TabsList className="grid w-full grid-cols-3 md:inline-flex md:w-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
							{categories.map((cat) => (
								<TabsTrigger key={cat.value} value={cat.value} className="px-6 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
									{cat.label}
								</TabsTrigger>
							))}
						</TabsList>
					</div>

					{categories.map((cat) => (
						<TabsContent key={cat.value} value={cat.value} className="mt-0">
							{cat.data.length === 0 ? (
								<div className="text-center py-12 text-muted-foreground">
									{t('categories.noListings', { defaultValue: 'Hetkel ei ole selles kategoorias kuulutusi' })}
								</div>
							) : (
								<>
									<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
										{cat.data.slice(0, 4).map((vehicle) => (
											<VehicleCard key={vehicle.id} vehicle={vehicle} />
										))}
									</div>

									<div className="mt-12 flex justify-center">
										<Link href={`/listings${cat.query}`}>
											<Button variant="outline" size="lg" className="rounded-full px-10 font-bold border-slate-300 dark:border-slate-700 hover:border-primary hover:text-primary transition-all gap-2">
												{t('categories.viewAll', { category: cat.label.toLowerCase() })} <ArrowRight className="h-4 w-4" />
											</Button>
										</Link>
									</div>
								</>
							)}
						</TabsContent>
					))}
				</Tabs>
			</div>
		</section>
	);
}
