"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface TimeSeriesPoint {
  date: string;
  impressions: number;
  clicks: number;
}

interface CampaignAnalyticsChartProps {
  timeSeries: TimeSeriesPoint[];
  totals: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
}

export function CampaignAnalyticsChart({ timeSeries, totals }: CampaignAnalyticsChartProps) {
  const { t } = useTranslation("ads");

  const maxImpressions = Math.max(...timeSeries.map((d) => d.impressions), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {totals.impressions.toLocaleString("et-EE")}
          </div>
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
            {t("admin.analytics.impressions")}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {totals.clicks.toLocaleString("et-EE")}
          </div>
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
            {t("admin.analytics.clicks")}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{totals.ctr}%</div>
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
            {t("admin.analytics.ctr")}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      {timeSeries.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
            {t("admin.analytics.chartTitle")}
          </h3>
          <div className="flex items-end gap-1 h-[200px]">
            {timeSeries.map((point, i) => {
              const height = (point.impressions / maxImpressions) * 100;
              const clickHeight =
                point.impressions > 0
                  ? (point.clicks / point.impressions) * height
                  : 0;

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap z-10">
                    <div>{new Date(point.date).toLocaleDateString("et-EE")}</div>
                    <div>{point.impressions} imp / {point.clicks} clicks</div>
                  </div>

                  {/* Bar */}
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: "100%" }}>
                    <div
                      className={cn(
                        "w-full rounded-t-sm bg-primary/20 relative overflow-hidden transition-all"
                      )}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      {/* Click overlay */}
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm"
                        style={{ height: `${clickHeight}%` }}
                      />
                    </div>
                  </div>

                  {/* Date label (show every nth) */}
                  {(i % Math.max(1, Math.floor(timeSeries.length / 7)) === 0 || i === timeSeries.length - 1) && (
                    <span className="text-[9px] text-muted-foreground mt-1">
                      {new Date(point.date).toLocaleDateString("et-EE", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-primary/20" />
              {t("admin.analytics.impressions")}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              {t("admin.analytics.clicks")}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-xl">
          No analytics data yet
        </div>
      )}
    </div>
  );
}
