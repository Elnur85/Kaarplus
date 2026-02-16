"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { VehicleSummary } from "@/types/vehicle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function VehicleCategories() {
    const { t } = useTranslation('home');

    // Mock data for initial implementation
    const mockVehicles: VehicleSummary[] = [
        {
            id: "1",
            make: "BMW",
            model: "520d",
            variant: "xDrive Luxury Line",
            year: 2021,
            price: 38500,
            priceVatIncluded: true,
            mileage: 42000,
            fuelType: "Diiesel",
            transmission: "Automaat",
            bodyType: "Sedaan",
            thumbnailUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop",
            status: "ACTIVE",
            badges: ["verified", "new"],
            createdAt: new Date().toISOString(),
        },
        {
            id: "2",
            make: "Tesla",
            model: "Model 3",
            variant: "Long Range AWD",
            year: 2022,
            price: 45000,
            priceVatIncluded: false,
            mileage: 15000,
            fuelType: "Elekter",
            transmission: "Automaat",
            bodyType: "Sedaan",
            thumbnailUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop",
            status: "ACTIVE",
            badges: ["hot_deal"],
            createdAt: new Date().toISOString(),
        },
        {
            id: "3",
            make: "Audi",
            model: "Q5",
            variant: "40 TDI quattro",
            year: 2020,
            price: 32900,
            priceVatIncluded: true,
            mileage: 68000,
            fuelType: "Hübriid",
            transmission: "Automaat",
            bodyType: "SUV",
            thumbnailUrl: "https://images.unsplash.com/photo-1606152421702-821294830f63?q=80&w=800&auto=format&fit=crop",
            status: "ACTIVE",
            badges: ["certified"],
            createdAt: new Date().toISOString(),
        },
        {
            id: "4",
            make: "Porsche",
            model: "Taycan",
            variant: "4S Business Edition",
            year: 2023,
            price: 115000,
            priceVatIncluded: true,
            mileage: 5000,
            fuelType: "Elekter",
            transmission: "Automaat",
            bodyType: "Sedaan",
            thumbnailUrl: "https://images.unsplash.com/photo-1614200028447-906033bb56ee?q=80&w=800&auto=format&fit=crop",
            status: "ACTIVE",
            badges: ["new"],
            createdAt: new Date().toISOString(),
        },
    ];

    const categories = [
        { value: "buy", label: t('categories.tabs.buy'), query: "" },
        { value: "electric", label: t('categories.tabs.electric'), query: "?fuelType=Electric" },
        { value: "hybrid", label: t('categories.tabs.hybrid'), query: "?fuelType=Hybrid" },
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {mockVehicles
                                    .filter((v) => {
                                        if (cat.value === "electric") return v.fuelType === "Elekter";
                                        if (cat.value === "hybrid") return v.fuelType === "Hübriid";
                                        return true;
                                    })
                                    .map((vehicle) => (
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
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>
    );
}

