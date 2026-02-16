"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { SellFormValues } from "@/schemas/sell-form";

import { useTranslation } from "react-i18next";

interface EquipmentCheckboxesProps {
    form: UseFormReturn<SellFormValues>;
}

export function EquipmentCheckboxes({ form }: EquipmentCheckboxesProps) {
    const { t } = useTranslation('sell');

    const featureGroups = [
        {
            title: t('features.comfort'),
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
            title: t('features.safety'),
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
            title: t('features.entertainment'),
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
            title: t('features.interior'),
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
                                    {t(`features.items.${feature}`)}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

