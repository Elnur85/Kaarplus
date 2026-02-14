"use client";

import { Car, Truck, Bike, Bus, ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const vehicleTypes = [
    { id: "Sedaan", name: "Sedaan", icon: Car },
    { id: "SUV", name: "Maastur (SUV)", icon: Car },
    { id: "Hatchback", name: "Luukpära", icon: Car },
    { id: "Universaal", name: "Universaal", icon: Car },
    { id: "Kupee", name: "Kupee", icon: Car },
    { id: "Kabriolett", name: "Kabriolett", icon: Car },
    { id: "Mahtuniversaal", name: "Mahtuniversaal", icon: Bus },
    { id: "Pikap", name: "Pikap", icon: Truck },
];

interface Step1VehicleTypeProps {
    selectedType: string;
    onSelect: (type: string) => void;
}

export function Step1VehicleType({ selectedType, onSelect }: Step1VehicleTypeProps) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight">Valige sõiduki tüüp</h2>
                <p className="text-muted-foreground mt-2">
                    See aitab meil pakkuda õigeid andmevälju järgmises sammus.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicleTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;

                    return (
                        <Card
                            key={type.id}
                            onClick={() => onSelect(type.id)}
                            className={cn(
                                "p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 border-2 group hover:border-primary/50",
                                isSelected
                                    ? "border-primary bg-primary/5 ring-4 ring-primary/5 shadow-md scale-105"
                                    : "border-border hover:bg-slate-50"
                            )}
                        >
                            <div
                                className={cn(
                                    "p-3 rounded-full mb-3 mb-4 transition-colors",
                                    isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:text-primary"
                                )}
                            >
                                <Icon size={32} />
                            </div>
                            <span className={cn("font-bold text-sm", isSelected ? "text-primary" : "text-slate-600")}>
                                {type.name}
                            </span>
                            {isSelected && (
                                <div className="absolute top-2 right-2 text-primary">
                                    <div className="bg-primary text-white rounded-full p-0.5">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
