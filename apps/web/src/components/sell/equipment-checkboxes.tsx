"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { SellFormValues } from "@/schemas/sell-form";

const featureGroups = [
    {
        title: "Mugavus",
        features: [
            "Kliimaseade",
            "Püsikiiruse hoidja",
            "Parkimisandurid",
            "Tagurduskaamera",
            "Võtmeta käivitus",
            "Elektrilised aknad",
            "Katuseluuk",
        ],
    },
    {
        title: "Turvalisus",
        features: [
            "ABS",
            "ESP",
            "Turvapadjad",
            "Sõiduraja hoidik",
            "Pimenurga hoiatus",
            "Liiklusmärkide tuvastus",
            "Automaatpidurdus",
        ],
    },
    {
        title: "Meelelahutus",
        features: [
            "Navigatsiooniseade",
            "Bluetooth",
            "Apple CarPlay",
            "Android Auto",
            "USB pesa",
            "Käed-vabad süsteem",
        ],
    },
    {
        title: "Sisu ja välimus",
        features: [
            "Nahkpolster",
            "Soojendusega istmed",
            "Valuveljed",
            "LED tuled",
            "Katuseraamid",
            "Toonitud klaasid",
        ],
    },
];

interface EquipmentCheckboxesProps {
    form: UseFormReturn<SellFormValues>;
}

export function EquipmentCheckboxes({ form }: EquipmentCheckboxesProps) {
    return (
        <div className="space-y-8">
            {featureGroups.map((group) => (
                <div key={group.title} className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <span className="w-8 h-px bg-muted" />
                        {group.title}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                        {group.features.map((feature) => (
                            <div key={feature} className="flex items-center space-x-3 group">
                                <Checkbox
                                    id={`feature-${feature}`}
                                    checked={form.watch(`features.${feature}`) || false}
                                    onCheckedChange={(checked) => {
                                        form.setValue(`features.${feature}`, !!checked, { shouldValidate: true });
                                    }}
                                    className="size-5 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <Label
                                    htmlFor={`feature-${feature}`}
                                    className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
                                >
                                    {feature}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
