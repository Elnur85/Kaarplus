"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/shared/pagination";
import { CampaignTable } from "@/components/admin/campaign-table";
import { CampaignForm } from "@/components/admin/campaign-form";
import { AlertCircle, Plus } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

const STATUS_TABS = ["ALL", "ACTIVE", "DRAFT", "PAUSED", "COMPLETED", "ARCHIVED"] as const;

export default function AdminAdsPage() {
  const { t, i18n } = useTranslation("ads");
  const { toast } = useToast();
  const localeCode =
    i18n.language === "et" ? "et-EE" : i18n.language === "ru" ? "ru-RU" : "en-GB";
   
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "20");
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`${API_URL}/admin/campaigns?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(t("admin.campaigns.error.message"));
      }

      const json = await res.json();
      setCampaigns(json.data || []);
      setTotal(json.meta?.total || 0);
    } catch (error) {
      console.error("[AdminAdsPage] Failed to fetch campaigns", {
        error,
        page,
        statusFilter,
      });

      setError(t("admin.campaigns.error.message"));
      setCampaigns([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, t]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleArchive = async (id: string) => {
    if (!confirm(t("admin.campaigns.archiveConfirm"))) return;

    try {
      const res = await fetch(`${API_URL}/admin/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to archive");

      toast({ title: t("admin.campaigns.toasts.archiveSuccess") });
      await fetchCampaigns();
    } catch (error) {
      console.error("[AdminAdsPage] Failed to archive campaign", {
        error,
        id,
      });

      toast({
        variant: "destructive",
        title: t("admin.campaigns.toasts.errorTitle"),
        description: t("admin.campaigns.toasts.archiveError"),
      });
    }
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("admin.campaigns.summaryTotal", {
              total: total.toLocaleString(localeCode),
            })}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary text-white font-bold gap-2"
        >
          <Plus size={18} />
          {t("admin.campaigns.create")}
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={handleStatusChange}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="px-4 font-semibold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              {t(`admin.campaigns.statuses.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Campaigns Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-lg mx-auto"
        >
          <AlertCircle className="text-destructive mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold text-destructive">
            {t("admin.campaigns.error.title")}
          </h3>
          <p className="text-muted-foreground mt-2 mb-6">{error}</p>
          <Button onClick={fetchCampaigns} variant="outline">
            {t("admin.campaigns.error.retry")}
          </Button>
        </div>
      ) : (
        <CampaignTable campaigns={campaigns} onArchive={handleArchive} />
      )}

      {/* Pagination */}
      {!isLoading && !error && total > 20 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / 20)}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Create Campaign Dialog */}
      <CampaignForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
}
