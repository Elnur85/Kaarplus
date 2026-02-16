"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/lib/utils";

const Counter = ({ end, label, suffix = "+" }: { end: number, label: string, suffix?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start > end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [end]);

    return (
        <div className="text-center">
            <div className="text-4xl font-extrabold mb-1 tabular-nums">
                {formatNumber(count)}{suffix}
            </div>
            <div className="text-white/80 text-sm font-medium uppercase tracking-wider">
                {label}
            </div>
        </div>
    );
};

export function StatisticsSection() {
    const { t } = useTranslation('home');
    return (
        <section className="py-12 bg-primary text-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <Counter end={5000} label={t('statistics.activeListings', { defaultValue: 'CARS AVAILABLE' })} />
                    <Counter end={12000} label={t('statistics.happyClients', { defaultValue: 'HAPPY USERS' })} suffix="k" />
                    <Counter end={8} label={t('statistics.yearsInMarket', { defaultValue: 'IN MARKET' })} suffix=" Yrs" />
                    <Counter end={14} label={t('statistics.avgSaleTime', { defaultValue: 'AVG SALE TIME' })} suffix=" Days" />
                </div>
            </div>
        </section>
    );
}

