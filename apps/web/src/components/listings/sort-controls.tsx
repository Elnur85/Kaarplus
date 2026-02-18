"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFilterStore } from "@/store/use-filter-store";

import { useTranslation } from "react-i18next";

export function SortControls() {
    const { t } = useTranslation('listings');
    const { sort, setFilter } = useFilterStore();

    const sortOptions = [
        { value: "newest", label: t('sort.newest') },
        { value: "oldest", label: t('sort.oldest') },
        { value: "price_asc", label: t('sort.priceLow') },
        { value: "price_desc", label: t('sort.priceHigh') },
    ];

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">{t('sort.label')}:</span>
            <Select value={sort} onValueChange={(val) => setFilter("sort", val)}>
                <SelectTrigger className="w-[200px] h-10 text-sm font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg focus:ring-primary focus:border-primary">
                    <SelectValue placeholder={t('sort.label')} />
                </SelectTrigger>
                <SelectContent>
                    {sortOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
