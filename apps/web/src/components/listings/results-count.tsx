"use client";

import { useTranslation } from "react-i18next";

interface ResultsCountProps {
    count: number;
    total: number;
    isLoading?: boolean;
}

export function ResultsCount({ count, total, isLoading }: ResultsCountProps) {
    const { t } = useTranslation('listings');

    if (isLoading) {
        return <div className="h-4 w-32 bg-muted animate-pulse rounded" />;
    }

    // Ensure total is a valid number
    const validTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
    const formattedTotal = validTotal.toLocaleString();

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('title')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('results.found', { count: validTotal, total: formattedTotal })}
            </p>
        </div>
    );
}
