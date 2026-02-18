"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReviewStats } from "@/components/reviews/review-stats";
import { ReviewList } from "@/components/reviews/review-list";
import { WriteReviewDialog } from "@/components/reviews/write-review-dialog";

interface SellerReviewsSectionProps {
  sellerId: string;
  sellerName: string;
}

export function SellerReviewsSection({
  sellerId,
  sellerName,
}: SellerReviewsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useTranslation("reviews");

  const handleReviewSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {t("sellerReviews", { name: sellerName })}
        </h2>
        <WriteReviewDialog
          targetId={sellerId}
          onSuccess={handleReviewSuccess}
        />
      </div>

      <div key={refreshKey}>
        <div className="space-y-6">
          <ReviewStats targetId={sellerId} />
          <ReviewList targetId={sellerId} />
        </div>
      </div>
    </section>
  );
}
