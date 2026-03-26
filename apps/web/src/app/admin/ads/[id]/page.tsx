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
import { AlertCircle, ArrowLeft, Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { API_URL } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CampaignDetailPage({ params }: Props) {
  const { id } = use(params);
  const { t, i18n } = useTranslation("ads");
  const localeCode =
    i18n.language === "et" ? "et-EE" : i18n.language === "ru" ? "ru-RU" : "en-GB";
   
  const [campaign, setCampaign] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isCampaignLoading, setIsCampaignLoading] = useState(true);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [isCampaignNotFound, setIsCampaignNotFound] = useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [showAdForm, setShowAdForm] = useState(false);

  const getPlacementText = (placementId: string | undefined, field: "name" | "description" = "name") => {
    if (!placementId) return "";

    const key = `admin.units.placements.${placementId}.${field}`;
    const translated = t(key);

    if (translated === key) {
      return field === "name" ? placementId : "";
    }

    return translated;
  };

  const fetchAnalytics = useCallback(async () => {
    setIsAnalyticsLoading(true);
    setAnalyticsError(null);

    try {
      const res = await fetch(`${API_URL}/admin/campaigns/${id}/analytics`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(t("admin.analytics.error.message"));
      }

      setAnalytics(
        json?.data ?? { timeSeries: [], totals: { impressions: 0, clicks: 0, ctr: 0 } }
      );
    } catch (error) {
      console.error("[CampaignDetailPage] Failed to fetch analytics", {
        error,
        id,
      });
      setAnalytics(null);
      setAnalyticsError(t("admin.analytics.error.message"));
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, [id, t]);

  const fetchCampaign = useCallback(async () => {
    setIsCampaignLoading(true);
    setCampaignError(null);
    setIsCampaignNotFound(false);
    setAnalytics(null);
    setAnalyticsError(null);
    setIsAnalyticsLoading(false);

    try {
      const res = await fetch(`${API_URL}/admin/campaigns/${id}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const isNotFound = res.status === 404 || json?.code === "CAMPAIGN_NOT_FOUND";

        if (isNotFound) {
          setCampaign(null);
          setIsCampaignNotFound(true);
          return;
        }

        throw new Error(t("admin.campaigns.detailError.message"));
      }

      setCampaign(json.data);
      await fetchAnalytics();
    } catch (error) {
      console.error("[CampaignDetailPage] Failed to fetch campaign", {
        error,
        id,
      });
      setCampaign(null);
      setCampaignError(t("admin.campaigns.detailError.message"));
    } finally {
      setIsCampaignLoading(false);
    }
  }, [fetchAnalytics, id, t]);

  useEffect(() => {
    void fetchCampaign();
  }, [fetchCampaign]);

  if (isCampaignLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (campaignError) {
    return (
      <div
        role="alert"
        className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-lg mx-auto"
      >
        <AlertCircle className="text-destructive mx-auto mb-4" size={48} />
        <h2 className="text-xl font-bold text-destructive">
          {t("admin.campaigns.detailError.title")}
        </h2>
        <p className="text-muted-foreground mt-2 mb-6">{campaignError}</p>
        <Button onClick={() => void fetchCampaign()} variant="outline">
          {t("admin.campaigns.detailError.retry")}
        </Button>
      </div>
    );
  }

  if (isCampaignNotFound || !campaign) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">{t("admin.campaigns.notFoundTitle")}</h2>
        <Link href="/admin/ads">
          <Button variant="outline" className="mt-4">{t("admin.campaigns.backToCampaigns")}</Button>
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
          <ArrowLeft size={16} /> {t("admin.campaigns.backToCampaigns")}
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
              {t("admin.campaigns.summary", {
                advertiser: campaign.advertiser.name || campaign.advertiser.email,
                priority: t(`admin.campaigns.priorities.${campaign.priority}`),
              })}
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
            {new Date(campaign.startDate).toLocaleDateString(localeCode)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {t("admin.campaigns.endDate")}
          </div>
          <div className="text-xl font-bold mt-1">
            {new Date(campaign.endDate).toLocaleDateString(localeCode)}
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
                  <TableHead className="font-bold">{t("admin.advertisements.table.title")}</TableHead>
                  <TableHead className="font-bold">{t("admin.advertisements.unit")}</TableHead>
                  <TableHead className="font-bold">{t("admin.campaigns.status")}</TableHead>
                  <TableHead className="font-bold text-right">{t("admin.advertisements.table.events")}</TableHead>
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
                        <div className="text-sm">{getPlacementText(ad.adUnit?.placementId)}</div>
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
          {isAnalyticsLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("admin.analytics.loading")}
            </div>
          ) : analyticsError ? (
            <div
              role="alert"
              className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-lg mx-auto"
            >
              <AlertCircle className="text-destructive mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-destructive">
                {t("admin.analytics.error.title")}
              </h3>
              <p className="text-muted-foreground mt-2 mb-6">{analyticsError}</p>
              <Button onClick={() => void fetchAnalytics()} variant="outline">
                {t("admin.analytics.error.retry")}
              </Button>
            </div>
          ) : analytics ? (
            <CampaignAnalyticsChart
              timeSeries={analytics.timeSeries || []}
              totals={analytics.totals || { impressions: 0, clicks: 0, ctr: 0 }}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t("admin.analytics.loading")}
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
