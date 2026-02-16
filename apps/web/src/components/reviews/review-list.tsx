"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "@/components/reviews/review-card";
import { useTranslation } from "react-i18next";

interface ReviewData {
  id: string;
  rating: number;
  title?: string;
  body: string;
  verified: boolean;
  createdAt: string;
  reviewer: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewListProps {
  targetId: string;
}

const PAGE_SIZE = 10;

export function ReviewList({ targetId }: ReviewListProps) {
  const { t } = useTranslation('reviews');
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchReviews = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews?targetId=${targetId}&page=${currentPage}&pageSize=${PAGE_SIZE}`
      );
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const json = await res.json();
      setReviews(json.data ?? []);
      setTotal(json.meta?.total ?? 0);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  // Reset page when targetId changes
  useEffect(() => {
    setPage(1);
  }, [targetId]);

  useEffect(() => {
    fetchReviews(page);
  }, [page, fetchReviews]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 py-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        <MessageSquare className="h-10 w-10" />
        <p className="text-sm">{t('noReviews')}</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('next')}
          </Button>
        </div>
      )}
    </div>
  );
}
