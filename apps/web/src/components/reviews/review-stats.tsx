"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ReviewStatsData {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

interface ReviewStatsProps {
  targetId: string;
}

export function ReviewStats({ targetId }: ReviewStatsProps) {
  const { t } = useTranslation("reviews");
  const [stats, setStats] = useState<ReviewStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/stats?targetId=${targetId}`
        );
        if (!res.ok) throw new Error("Failed to fetch stats");
        const json = await res.json();
        setStats(json.data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [targetId]);

  if (loading) {
    return (
      <div className="flex gap-8">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-12 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex-1 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { averageRating, totalReviews, distribution } = stats;

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
      <div className="flex flex-col items-center gap-1">
        <span className="text-4xl font-bold text-foreground">
          {averageRating.toFixed(1)}
        </span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.round(averageRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted"
              )}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {t("labels.reviewsCount", { count: totalReviews })}
        </span>
      </div>

      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] ?? 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-8 text-right text-sm text-muted-foreground">
                {star}
              </span>
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <Progress value={percentage} className="h-2 flex-1" />
              <span className="w-8 text-right text-sm text-muted-foreground">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
