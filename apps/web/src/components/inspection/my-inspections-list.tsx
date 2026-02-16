"use client";

import * as React from "react";
import { ClipboardList } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { et } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InspectionStatusCard,
  type Inspection,
} from "@/components/inspection/inspection-status-card";
import { cn } from "@/lib/utils";

// Re-export formatDistanceToNow wrapper for Estonian locale
function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: et });
}

export function MyInspectionsList() {
  const [inspections, setInspections] = React.useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchInspections = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/inspections`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Ülevaatuste laadimine ebaõnnestus");
        }

        const result = await response.json();
        setInspections(result.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ülevaatuste laadimine ebaõnnestus"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspections();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-16 w-24 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center"
        )}
      >
        <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Ülevaatusi pole tellitud</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Siin kuvatakse teie tellitud sõidukite ülevaatused. Ülevaatuse saate
          tellida sõiduki detailvaates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Minu ülevaatused ({inspections.length})
        </h2>
      </div>
      <div className="space-y-4">
        {inspections.map((inspection) => (
          <div key={inspection.id}>
            <InspectionStatusCard inspection={inspection} />
            <p className="mt-1 px-1 text-xs text-muted-foreground">
              {timeAgo(inspection.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
