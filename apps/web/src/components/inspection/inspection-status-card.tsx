import * as React from "react";
import Image from "next/image";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type InspectionStatus =
  | "PENDING"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

interface InspectionListing {
  id: string;
  make: string;
  model: string;
  year: number;
  images: { url: string }[];
}

interface Inspection {
  id: string;
  listingId: string;
  requesterId: string;
  status: InspectionStatus;
  inspectorNotes?: string | null;
  reportUrl?: string | null;
  scheduledAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  listing: InspectionListing;
}

interface InspectionStatusCardProps {
  inspection: Inspection;
}

const STATUS_CONFIG: Record<
  InspectionStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Ootel",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
  },
  SCHEDULED: {
    label: "Planeeritud",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Calendar,
  },
  IN_PROGRESS: {
    label: "Käimas",
    className: "bg-primary/10 text-primary border-primary/20",
    icon: FileText,
  },
  COMPLETED: {
    label: "Lõpetatud",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Tühistatud",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("et-EE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function InspectionStatusCard({ inspection }: InspectionStatusCardProps) {
  const { listing, status } = inspection;
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const thumbnailUrl = listing.images?.[0]?.url;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {thumbnailUrl && (
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={thumbnailUrl}
                  alt={`${listing.year} ${listing.make} ${listing.model}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            )}
            <div>
              <CardTitle className="text-base">
                {listing.year} {listing.make} {listing.model}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Tellitud: {formatDate(inspection.createdAt)}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("shrink-0 gap-1", config.className)}
          >
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {inspection.scheduledAt && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Planeeritud:</span>
            <span className="font-medium">
              {formatDate(inspection.scheduledAt)}
            </span>
          </div>
        )}

        {inspection.completedAt && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Lõpetatud:</span>
            <span className="font-medium">
              {formatDate(inspection.completedAt)}
            </span>
          </div>
        )}

        {inspection.inspectorNotes && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Inspektori märkused
            </p>
            <p className="text-sm">{inspection.inspectorNotes}</p>
          </div>
        )}

        {inspection.reportUrl && status === "COMPLETED" && (
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a
              href={inspection.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" />
              Laadi aruanne alla
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export type { Inspection, InspectionStatus, InspectionStatusCardProps };
