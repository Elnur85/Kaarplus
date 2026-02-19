"use client";

import { useState } from "react";
import {
    Car,
    Truck,
    Bike,
    Sailboat,
    Anchor,
    Shovel,
    Tractor,
    TreeDeciduous,
    Trash2,
    ArrowLeft,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { BODY_TYPE_HIERARCHY, getSubtypes } from "@/lib/body-types";

// Map category keys to icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const categoryIcons: Record<string, React.ComponentType<any>> = {
    passengerCar: Car,
    suv: Car,
    commercialVehicle: Truck,
    truck: Truck,
    mototechnics: Bike,
    waterVehicle: Sailboat,
    trailer: Anchor,
    caravan: Anchor,
    constructionMachinery: Shovel,
    agriculturalMachinery: Tractor,
    forestMachinery: TreeDeciduous,
    communalMachinery: Trash2,
};

interface Step1VehicleTypeProps {
    selectedType: string;
    onSelect: (type: string) => void;
}

export function Step1VehicleType({ selectedType, onSelect }: Step1VehicleTypeProps) {
    const { t } = useTranslation('sell');

    // Parse current selection to determine if we have a category and/or subtype selected
    const parseSelection = (value: string) => {
        if (!value) return { category: null, subtype: null };
        if (value.includes(':')) {
            const [cat, sub] = value.split(':');
            return { category: cat, subtype: sub };
        }
        // Check if value is a category itself
        const isCategory = BODY_TYPE_HIERARCHY.some((cat) => cat.key === value);
        if (isCategory) {
            return { category: value, subtype: null };
        }
        return { category: null, subtype: value };
    };

    const { category: selectedCategory, subtype: selectedSubtype } = parseSelection(selectedType);

    // State for tracking which category is selected for viewing subtypes
    const [viewingCategory, setViewingCategory] = useState<string | null>(selectedCategory);

    const handleCategoryClick = (categoryKey: string) => {
        setViewingCategory(categoryKey);
    };

    const handleSubtypeClick = (categoryKey: string, subtypeKey: string) => {
        onSelect(`${categoryKey}:${subtypeKey}`);
    };

    const handleBackToCategories = () => {
        setViewingCategory(null);
    };

    const handleSelectCategoryOnly = () => {
        if (viewingCategory) {
            onSelect(viewingCategory);
        }
    };

    // If viewing a category's subtypes
    if (viewingCategory) {
        const subtypes = getSubtypes(viewingCategory);
        const categoryLabel = t(`step1.categories.${viewingCategory}`, viewingCategory);

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToCategories}
                        className="gap-2"
                    >
                        <ArrowLeft size={16} />
                        {t('step1.backToCategories', 'Tagasi kategooriatesse')}
                    </Button>
                </div>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {t('step1.selectSubtype', 'Vali alamkategooria')}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        {categoryLabel}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {subtypes.map((subtype) => {
                        const isSelected = selectedCategory === viewingCategory && selectedSubtype === subtype;
                        const subtypeLabel = t(`step1.subtypes.${subtype}`, subtype);

                        return (
                            <Card
                                key={subtype}
                                onClick={() => handleSubtypeClick(viewingCategory, subtype)}
                                className={cn(
                                    "p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 border-2 group hover:border-primary/50",
                                    isSelected
                                        ? "border-primary bg-primary/5 ring-2 ring-primary/10 shadow-md"
                                        : "border-border hover:bg-slate-50"
                                )}
                            >
                                <span className={cn("font-medium text-sm", isSelected ? "text-primary" : "text-slate-600")}>
                                    {subtypeLabel}
                                </span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <div className="bg-primary text-white rounded-full p-0.5">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* Option to select just the category without subtype */}
                <div className="pt-4 border-t border-slate-100">
                    <Button
                        variant="outline"
                        onClick={handleSelectCategoryOnly}
                        className={cn(
                            "w-full",
                            selectedCategory === viewingCategory && !selectedSubtype && "border-primary bg-primary/5"
                        )}
                    >
                        {t('step1.selectGeneral', 'Vali üldine: {{category}}', { category: categoryLabel })}
                    </Button>
                </div>
            </div>
        );
    }

    // Show main categories
    return (
        <div className="space-y-6">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight">{t('step1.title')}</h2>
                <p className="text-muted-foreground mt-2">
                    {t('step1.description')}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {BODY_TYPE_HIERARCHY.map((category) => {
                    const Icon = categoryIcons[category.key] || Car;
                    const isSelected = selectedCategory === category.key && !selectedSubtype;
                    const hasSubtypeSelected = selectedCategory === category.key && !!selectedSubtype;
                    const categoryLabel = t(`step1.categories.${category.key}`, category.key);

                    return (
                        <Card
                            key={category.key}
                            onClick={() => handleCategoryClick(category.key)}
                            className={cn(
                                "p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 border-2 group hover:border-primary/50 relative",
                                isSelected
                                    ? "border-primary bg-primary/5 ring-4 ring-primary/5 shadow-md scale-105"
                                    : hasSubtypeSelected
                                        ? "border-primary/50 bg-primary/5"
                                        : "border-border hover:bg-slate-50"
                            )}
                        >
                            <div
                                className={cn(
                                    "p-3 rounded-full mb-4 transition-colors",
                                    isSelected || hasSubtypeSelected
                                        ? "bg-primary text-white"
                                        : "bg-muted text-muted-foreground group-hover:text-primary"
                                )}
                            >
                                <Icon size={28} />
                            </div>
                            <span className={cn(
                                "font-bold text-sm",
                                isSelected || hasSubtypeSelected ? "text-primary" : "text-slate-600"
                            )}>
                                {categoryLabel}
                            </span>
                            {hasSubtypeSelected && (
                                <span className="text-xs text-muted-foreground mt-1">
                                    {t(`step1.subtypes.${selectedSubtype}`, selectedSubtype)}
                                </span>
                            )}
                            {(isSelected || hasSubtypeSelected) && (
                                <div className="absolute top-2 right-2">
                                    <div className="bg-primary text-white rounded-full p-0.5">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Show currently selected if any */}
            {selectedType && (
                <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                        {t('step1.selected', 'Valitud')}: <span className="font-medium text-foreground">
                            {selectedCategory && t(`step1.categories.${selectedCategory}`, selectedCategory)}
                            {selectedSubtype && ` - ${t(`step1.subtypes.${selectedSubtype}`, selectedSubtype)}`}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
