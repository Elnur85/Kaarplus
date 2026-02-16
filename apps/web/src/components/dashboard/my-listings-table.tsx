"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatPrice, formatNumber } from "@/lib/utils";

type ListingStatus = "ACTIVE" | "PENDING" | "SOLD" | "REJECTED" | "DRAFT";

interface UserListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  priceVatIncluded: boolean;
  status: ListingStatus;
  thumbnailUrl: string;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
}

const statusConfig: Record<
  ListingStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Aktiivne",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  PENDING: {
    label: "Ootel",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  SOLD: {
    label: "Müüdud",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  REJECTED: {
    label: "Tagasi lükatud",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  DRAFT: {
    label: "Mustand",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
};

import { useTranslation } from "react-i18next";

function StatusBadge({ status }: { status: ListingStatus }) {
  const { t } = useTranslation('dashboard');
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {t(`listings.status.${status.toLowerCase()}`)}
    </Badge>
  );
}

// Mock data for development
const mockListings: UserListing[] = [
  {
    id: "1",
    make: "BMW",
    model: "330e",
    year: 2022,
    price: 35900,
    priceVatIncluded: true,
    status: "ACTIVE",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=400",
    viewCount: 245,
    favoriteCount: 18,
    createdAt: "2025-12-15T10:00:00Z",
  },
  {
    id: "2",
    make: "Volkswagen",
    model: "ID.4",
    year: 2023,
    price: 42500,
    priceVatIncluded: true,
    status: "ACTIVE",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=400",
    viewCount: 189,
    favoriteCount: 12,
    createdAt: "2025-12-20T14:30:00Z",
  },
  {
    id: "3",
    make: "Toyota",
    model: "RAV4 Hybrid",
    year: 2021,
    price: 28900,
    priceVatIncluded: false,
    status: "PENDING",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=400",
    viewCount: 0,
    favoriteCount: 0,
    createdAt: "2026-01-05T09:15:00Z",
  },
  {
    id: "4",
    make: "Audi",
    model: "A4 Avant",
    year: 2020,
    price: 24500,
    priceVatIncluded: true,
    status: "SOLD",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=400",
    viewCount: 512,
    favoriteCount: 34,
    createdAt: "2025-11-10T08:00:00Z",
  },
  {
    id: "5",
    make: "Tesla",
    model: "Model 3",
    year: 2023,
    price: 39900,
    priceVatIncluded: true,
    status: "DRAFT",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400",
    viewCount: 0,
    favoriteCount: 0,
    createdAt: "2026-01-20T16:45:00Z",
  },
];

function ListingTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-12 w-16 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

interface MyListingsTableProps {
  limit?: number;
  showPagination?: boolean;
}

export function MyListingsTable({
  limit,
  showPagination = false,
}: MyListingsTableProps) {
  const { t, i18n } = useTranslation('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading] = useState(false);
  const pageSize = limit || 10;
  const localeCode = i18n.language === 'et' ? 'et-EE' : i18n.language === 'ru' ? 'ru-RU' : 'en-GB';

  // Use mock data; in production, fetch from API
  const allListings = mockListings;
  const totalPages = Math.ceil(allListings.length / pageSize);
  const displayedListings = allListings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return <ListingTableSkeleton />;
  }

  if (allListings.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 rounded-xl border p-12 text-center">
        <p className="text-lg font-medium text-foreground">
          {t('listings.table.empty')}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('listings.description')}
        </p>
        <Button asChild>
          <Link href="/sell">{t('overview.addListing')}</Link>
        </Button>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(localeCode, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden md:block">
        <Card className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[300px]">{t('listings.table.listing')}</TableHead>
                <TableHead>{t('listings.table.price')}</TableHead>
                <TableHead>{t('listings.table.status')}</TableHead>
                <TableHead className="text-center">{t('listings.table.views')}</TableHead>
                <TableHead className="text-center">{t('listings.table.favorites')}</TableHead>
                <TableHead>{t('listings.table.date')}</TableHead>
                <TableHead className="text-right">{t('listings.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={listing.thumbnailUrl}
                          alt={`${listing.make} ${listing.model}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {listing.year} {listing.make} {listing.model}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {formatPrice(listing.price, listing.priceVatIncluded)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={listing.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {formatNumber(listing.viewCount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {formatNumber(listing.favoriteCount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(listing.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title={t('listings.actions.edit')}>
                        <Link href={`/dashboard/listings/${listing.id}/edit`}>
                          <Pencil className="size-4" />
                          <span className="sr-only">{t('listings.actions.edit')}</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title={t('overview.viewAll')}>
                        <Link href={`/listings/${listing.id}`}>
                          <ExternalLink className="size-4" />
                          <span className="sr-only">{t('overview.viewAll')}</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {displayedListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden rounded-xl border p-4">
            <div className="flex gap-3">
              <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={listing.thumbnailUrl}
                  alt={`${listing.make} ${listing.model}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {listing.year} {listing.make} {listing.model}
                  </p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums text-primary">
                    {formatPrice(listing.price, listing.priceVatIncluded)}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={listing.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(listing.viewCount)} {t('listings.table.views')}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">
                {formatDate(listing.createdAt)}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    <Pencil className="mr-1 size-3" />
                    {t('listings.actions.edit')}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/listings/${listing.id}`}>
                    <ExternalLink className="mr-1 size-3" />
                    {t('overview.viewAll')}
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {t('listings.pagination.page', { current: currentPage, total: totalPages })} ({t('listings.pagination.total', { count: allListings.length })})
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">{t('listings.pagination.previous')}</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">{t('listings.pagination.next')}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

