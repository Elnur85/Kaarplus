"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/constants";
import { useTranslation } from "react-i18next";

interface AdUnitWithOccupancy {
  id: string;
  name: string;
  placementId: string;
  type: string;
  width: number;
  height: number;
  description: string | null;
  active: boolean;
  activeAdsCount: number;
}

export default function AdInventoryPage() {
  const { t } = useTranslation("ads");
  const [units, setUnits] = useState<AdUnitWithOccupancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/ad-units`, { credentials: "include" })
      .then((res) => res.json())
      .then((json) => setUnits(json.data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.units.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All available ad placement slots and their current occupancy
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">{t("admin.units.placement")}</TableHead>
                <TableHead className="font-bold">{t("admin.units.type")}</TableHead>
                <TableHead className="font-bold">{t("admin.units.dimensions")}</TableHead>
                <TableHead className="font-bold">{t("admin.units.occupancy")}</TableHead>
                <TableHead className="font-bold">{t("admin.campaigns.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>
                    <div className="font-semibold text-sm">{unit.name}</div>
                    {unit.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">{unit.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                      {unit.placementId}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                      {unit.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {unit.width} × {unit.height}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            unit.activeAdsCount > 0 ? "bg-primary" : "bg-slate-300"
                          )}
                          style={{ width: `${Math.min(unit.activeAdsCount * 25, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {unit.activeAdsCount} active
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold",
                        unit.active
                          ? "text-emerald-600 border-emerald-200"
                          : "text-slate-400 border-slate-200"
                      )}
                    >
                      {unit.active ? t("admin.units.active") : t("admin.units.inactive")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
