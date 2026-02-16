"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FeatureBadgesProps {
    features: Record<string, any>;
}

export function FeatureBadges({ features }: FeatureBadgesProps) {
    const { t } = useTranslation(['carDetail', 'sell']);

    // Filter only true features or all keys if record is just a list
    const activeFeatures = Object.entries(features)
        .filter(([_, value]) => value === true || value === "true")
        .map(([key]) => key);

    if (!activeFeatures.length) {
        return <p className="text-muted-foreground text-sm italic">{t('features.notSpecified')}</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
            {activeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 group">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-700">
                        {t(`features.items.${feature}`, { ns: 'sell', defaultValue: feature })}
                    </span>
                </div>
            ))}
        </div>
    );
}
