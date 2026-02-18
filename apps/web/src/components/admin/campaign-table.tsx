"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatPrice } from "@/lib/utils";
import { Eye, Archive } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface Campaign {
  id: string;
  name: string;
  status: string;
  priority: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  advertiser: { id: string; name: string | null; email: string };
  _count: { advertisements: number; sponsoredListings: number };
}

interface CampaignTableProps {
  campaigns: Campaign[];
  onArchive: (id: string) => void;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAUSED: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  ARCHIVED: "bg-slate-100 text-slate-500 border-slate-200",
};

const priorityLabels: Record<number, string> = {
  1: "Takeover",
  2: "House",
  3: "Programmatic",
};

export function CampaignTable({ campaigns, onArchive }: CampaignTableProps) {
  const { t } = useTranslation("ads");

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("et-EE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-800/50">
            <TableHead className="font-bold">{t("admin.campaigns.name")}</TableHead>
            <TableHead className="font-bold">{t("admin.campaigns.status")}</TableHead>
            <TableHead className="font-bold">{t("admin.campaigns.priority")}</TableHead>
            <TableHead className="font-bold text-right">{t("admin.campaigns.budget")}</TableHead>
            <TableHead className="font-bold text-right">{t("admin.campaigns.spent")}</TableHead>
            <TableHead className="font-bold">{t("admin.campaigns.startDate")}</TableHead>
            <TableHead className="font-bold">{t("admin.campaigns.endDate")}</TableHead>
            <TableHead className="font-bold text-right">{t("admin.campaigns.ads")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                {t("admin.campaigns.empty")}
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign) => (
              <TableRow key={campaign.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <TableCell>
                  <div>
                    <div className="font-semibold text-sm">{campaign.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {campaign.advertiser.name || campaign.advertiser.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "uppercase text-[10px] font-bold tracking-wider",
                      statusColors[campaign.status]
                    )}
                  >
                    {t(`admin.campaigns.statuses.${campaign.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t(`admin.campaigns.priorities.${campaign.priority}`, {
                      defaultValue: priorityLabels[campaign.priority],
                    })}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium text-sm">
                  {formatPrice(Number(campaign.budget))}
                </TableCell>
                <TableCell className="text-right text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      Number(campaign.spent) > Number(campaign.budget) * 0.8
                        ? "text-red-600"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatPrice(Number(campaign.spent))}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(campaign.startDate)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(campaign.endDate)}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {campaign._count.advertisements}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                      <Link href={`/admin/ads/${campaign.id}`}>
                        <Eye size={16} />
                      </Link>
                    </Button>
                    {campaign.status !== "ARCHIVED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                        onClick={() => onArchive(campaign.id)}
                      >
                        <Archive size={16} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
