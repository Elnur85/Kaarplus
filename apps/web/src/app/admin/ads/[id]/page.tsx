"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CampaignAnalyticsChart } from "@/components/admin/campaign-analytics-chart";
import { AdForm } from "@/components/admin/ad-form";
import { ArrowLeft, Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { API_URL } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CampaignDetailPage({ params }: Props) {
  const { id } = use(params);
  const { t } = useTranslation("ads");
   
  const [campaign, setCampaign] = useState<any>(null);
   
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdForm, setShowAdForm] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/campaigns/${id}`, {
        credentials: "include",
      });
      const json = await res.json();
      setCampaign(json.data);
    } catch (error) {
      console.error("Failed to fetch campaign:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/campaigns/${id}/analytics`, {
        credentials: "include",
      });
      const json = await res.json();
      setAnalytics(json.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
    fetchAnalytics();
  }, [fetchCampaign, fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Campaign not found</h2>
        <Link href="/admin/ads">
          <Button variant="outline" className="mt-4">Back to campaigns</Button>
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    ACTIVE: "bg-emerald-50 text-emerald-700",
    PAUSED: "bg-amber-50 text-amber-700",
    COMPLETED: "bg-blue-50 text-blue-700",
    ARCHIVED: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Link href="/admin/ads" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> {t("admin.campaigns.title")}
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
              <Badge
                className={cn(
                  "uppercase text-[10px] font-bold tracking-wider border-none",
                  statusColors[campaign.status]
                )}
              >
                {t(`admin.campaigns.statuses.${campaign.status}`)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {campaign.advertiser.name || campaign.advertiser.email} · Priority{" "}
              {t(`admin.campaigns.priorities.${campaign.priority}`)}
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {t("admin.campaigns.budget")}
          </div>
          <div className="text-xl font-bold mt-1">{formatPrice(Number(campaign.budget))}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {t("admin.campaigns.spent")}
          </div>
          <div className="text-xl font-bold mt-1 text-primary">{formatPrice(Number(campaign.spent))}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {t("admin.campaigns.startDate")}
          </div>
          <div className="text-xl font-bold mt-1">
            {new Date(campaign.startDate).toLocaleDateString("et-EE")}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {t("admin.campaigns.endDate")}
          </div>
          <div className="text-xl font-bold mt-1">
            {new Date(campaign.endDate).toLocaleDateString("et-EE")}
          </div>
        </div>
      </div>

      {/* Tabs: Ads + Analytics */}
      <Tabs defaultValue="ads" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger value="ads" className="font-semibold data-[state=active]:bg-white rounded-md px-6">
            {t("admin.advertisements.title")} ({campaign.advertisements?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="font-semibold data-[state=active]:bg-white rounded-md px-6">
            {t("admin.analytics.title")}
          </TabsTrigger>
        </TabsList>

        {/* Advertisements Tab */}
        <TabsContent value="ads" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowAdForm(true)} className="bg-primary text-white font-bold gap-2" size="sm">
              <Plus size={16} />
              {t("admin.advertisements.create")}
            </Button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">Title</TableHead>
                  <TableHead className="font-bold">{t("admin.advertisements.unit")}</TableHead>
                  <TableHead className="font-bold">{t("admin.campaigns.status")}</TableHead>
                  <TableHead className="font-bold text-right">Events</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!campaign.advertisements || campaign.advertisements.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      {t("admin.advertisements.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                   
                  campaign.advertisements.map((ad: any) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div className="font-semibold text-sm">{ad.title}</div>
                        {ad.linkUrl && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{ad.linkUrl}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{ad.adUnit?.name}</div>
                        <div className="text-xs text-muted-foreground">{ad.adUnit?.placementId}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] font-bold", ad.active ? "text-emerald-600 border-emerald-200" : "text-slate-400")}>
                          {ad.active ? t("admin.advertisements.active") : t("admin.advertisements.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {ad._count?.analytics || 0}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          {analytics ? (
            <CampaignAnalyticsChart
              timeSeries={analytics.timeSeries || []}
              totals={analytics.totals || { impressions: 0, clicks: 0, ctr: 0 }}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Loading analytics...
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Ad Dialog */}
      <AdForm
        open={showAdForm}
        onOpenChange={setShowAdForm}
        campaignId={id}
        onSuccess={fetchCampaign}
      />
    </div>
  );
}
