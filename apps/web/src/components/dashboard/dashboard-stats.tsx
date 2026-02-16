"use client";

import { List, Eye, Heart, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

interface DashboardStatsData {
  activeListings: number;
  totalViews: number;
  totalFavorites: number;
  totalMessages: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBgClass: string;
  iconColorClass: string;
  trend?: { value: number; isPositive: boolean };
}

import { useTranslation } from "react-i18next";

function StatCard({
  title,
  value,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  trend,
}: StatCardProps) {
  return (
    <Card className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClass}`}>
          <Icon className={`size-5 ${iconColorClass}`} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded ${trend.isPositive
              ? "text-primary bg-primary/10"
              : "text-red-500 bg-red-50 dark:bg-red-950/30"
            }`}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
        {formatNumber(value)}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">
        {title}
      </p>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const { t } = useTranslation('dashboard');
  const cards: StatCardProps[] = [
    {
      title: t('stats.activeListings'),
      value: stats.activeListings,
      icon: List,
      iconBgClass: "bg-primary/10",
      iconColorClass: "text-primary",
    },
    {
      title: t('stats.totalViews'),
      value: stats.totalViews,
      icon: Eye,
      iconBgClass: "bg-blue-50",
      iconColorClass: "text-blue-500",
    },
    {
      title: t('stats.totalFavorites'),
      value: stats.totalFavorites,
      icon: Heart,
      iconBgClass: "bg-amber-50",
      iconColorClass: "text-amber-500",
    },
    {
      title: t('stats.totalMessages'),
      value: stats.totalMessages,
      icon: MessageCircle,
      iconBgClass: "bg-slate-100",
      iconColorClass: "text-slate-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
