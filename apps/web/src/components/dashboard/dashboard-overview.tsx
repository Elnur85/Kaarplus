"use client";

import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { MyListingsTable } from "@/components/dashboard/my-listings-table";

// Mock stats data; in production, fetch from API
const mockStats = {
  activeListings: 3,
  totalViews: 946,
  totalFavorites: 64,
  totalMessages: 12,
};

import { useTranslation } from "react-i18next";

export function DashboardOverview() {
  const { t } = useTranslation('dashboard');
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('overview.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('overview.welcome')}
          </p>
        </div>
        <Button asChild>
          <Link href="/sell">
            <Plus className="mr-2 size-4" />
            {t('overview.addListing')}
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <DashboardStats stats={mockStats} />

      {/* Recent listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {t('overview.recentListings')}
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/listings">
              {t('overview.viewAll')}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
        <MyListingsTable limit={5} />
      </div>
    </div>
  );
}

