"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MyListingsTable } from "@/components/dashboard/my-listings-table";

export function ListingsManagement() {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("listings.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("listings.description")}
          </p>
        </div>
        <Button asChild>
          <Link href="/sell">
            <Plus className="mr-2 size-4" />
            {t("overview.addListing")}
          </Link>
        </Button>
      </div>

      {/* Full listings table with pagination */}
      <MyListingsTable showPagination />
    </div>
  );
}
