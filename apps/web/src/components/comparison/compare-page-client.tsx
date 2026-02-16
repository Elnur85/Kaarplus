"use client";

import { useState } from "react";
import { Trash2, Share2, GitCompareArrows } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useCompareStore } from "@/store/use-compare-store";
import { CompareVehicleCard } from "./compare-vehicle-card";
import { CompareEmptySlot } from "./compare-empty-slot";
import { ComparisonTable } from "./comparison-table";
import { AddVehicleSheet } from "./add-vehicle-sheet";

import { useTranslation } from "react-i18next";

export function ComparePageClient() {
    const { t } = useTranslation('compare');
    const { vehicles, clearAll } = useCompareStore();
    const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    const emptySlots = Math.max(0, 4 - vehicles.length);

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-8">
            <Breadcrumbs items={[{ label: t('breadcrumb') }]} />

            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {t('title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                {vehicles.length >= 2 && (
                    <div className="flex items-center gap-6 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Label
                                htmlFor="diff-toggle"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                                {t('filters.differencesOnly')}
                            </Label>
                            <Switch
                                id="diff-toggle"
                                checked={showDifferencesOnly}
                                onCheckedChange={setShowDifferencesOnly}
                            />
                        </div>
                        <div className="h-6 w-px bg-border" />
                        <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                            <Share2 size={14} />
                            {t('buttons.share')}
                        </button>
                        {vehicles.length > 0 && (
                            <>
                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                                <button
                                    onClick={clearAll}
                                    className="flex items-center gap-2 text-sm font-medium text-destructive hover:underline"
                                >
                                    <Trash2 size={14} />
                                    {t('buttons.clearAll')}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Vehicle Cards Header */}
            {vehicles.length > 0 && (
                <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm pt-2 pb-4 -mx-6 px-6">
                    <div className="grid grid-cols-2 md:grid-cols-[240px_1fr_1fr_1fr_1fr] gap-4">
                        {/* Label column (hidden on mobile) */}
                        <div className="hidden md:flex items-end pb-4">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {t('sections.specs')}
                            </div>
                        </div>

                        {vehicles.map((vehicle) => (
                            <CompareVehicleCard
                                key={vehicle.id}
                                vehicle={vehicle}
                            />
                        ))}

                        {Array.from({ length: emptySlots }).map((_, i) => (
                            <CompareEmptySlot
                                key={`slot-${i}`}
                                onClick={() => setSheetOpen(true)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Comparison Table */}
            {vehicles.length >= 2 ? (
                <ComparisonTable
                    vehicles={vehicles}
                    showDifferencesOnly={showDifferencesOnly}
                />
            ) : (
                <EmptyState
                    vehicleCount={vehicles.length}
                    onAddClick={() => setSheetOpen(true)}
                />
            )}

            {/* Add Vehicle Sheet */}
            <AddVehicleSheet open={sheetOpen} onOpenChange={setSheetOpen} />
        </div>
    );
}

function EmptyState({
    vehicleCount,
    onAddClick,
}: {
    vehicleCount: number;
    onAddClick: () => void;
}) {
    const { t } = useTranslation('compare');
    return (
        <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GitCompareArrows size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
                {vehicleCount === 0
                    ? t('emptyStates.start.title')
                    : t('emptyStates.addMore.title')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {vehicleCount === 0
                    ? t('emptyStates.start.description')
                    : t('emptyStates.addMore.description')}
            </p>
            <div className="flex items-center justify-center gap-3">
                <Button onClick={onAddClick}>{t('buttons.addVehicle')}</Button>
                <Button variant="outline" asChild>
                    <Link href="/listings">{t('buttons.browseListings')}</Link>
                </Button>
            </div>
        </div>
    );
}

