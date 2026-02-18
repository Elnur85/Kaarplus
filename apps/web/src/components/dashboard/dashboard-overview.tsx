"use client";

import Link from "next/link";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { MyListingsTable } from "@/components/dashboard/my-listings-table";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { API_URL } from "@/lib/constants";
import { useTranslation } from "react-i18next";

interface DashboardStatsData {
  activeListings: number;
  totalViews: number;
  totalFavorites: number;
  totalMessages: number;
}

export function DashboardOverview() {
  const { t } = useTranslation('dashboard');
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    // Fetch dashboard stats
    fetch(`${API_URL}/user/dashboard/stats`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        setStats(json.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [session?.user]);

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
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <DashboardStats 
          stats={stats || { activeListings: 0, totalViews: 0, totalFavorites: 0, totalMessages: 0 }} 
        />
      )}

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
