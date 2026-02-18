"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart, Search } from "lucide-react";
import Link from "next/link";
import { VehicleCard } from "@/components/shared/vehicle-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { VehicleSummary } from "@/types/vehicle";
import { API_URL } from "@/lib/constants";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 12;

export default function FavoritesPage() {
    const { t } = useTranslation('favorites');
    const [favorites, setFavorites] = useState<VehicleSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFavorites = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: PAGE_SIZE.toString(),
            });

            const response = await fetch(
                `${API_URL}/user/favorites?${params.toString()}`,
                { credentials: "include" }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch favorites");
            }

            const json = await response.json();
            setFavorites(json.data || []);
            setTotal(json.meta?.total || 0);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
            setFavorites([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div className="container py-8 min-h-screen">
            <Breadcrumbs items={[{ label: t('breadcrumb') }]} />

            <h1 className="text-2xl font-bold text-slate-800 mb-8">
                {t('title')}
            </h1>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <FavoriteSkeleton key={i} />
                    ))}
                </div>
            ) : favorites.length > 0 ? (
                <>
                    <p className="text-sm text-muted-foreground mb-6">
                        {total} {total === 1 ? t('count', { count: total }) : t('count_plural', { count: total })}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((vehicle) => (
                            <VehicleCard
                                key={vehicle.id}
                                vehicle={{ ...vehicle, isFavorited: true }}
                                variant="grid"
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border pt-8">
                            <p className="text-sm text-muted-foreground">
                                {t('showing', {
                                    start: (page - 1) * PAGE_SIZE + 1,
                                    end: Math.min(page * PAGE_SIZE, total),
                                    total: total
                                })}
                            </p>
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                isLoading={isLoading}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="py-20 text-center border rounded-xl bg-card border-dashed">
                    <Heart
                        size={48}
                        className="mx-auto text-muted-foreground/40 mb-4"
                    />
                    <h3 className="text-lg font-semibold text-slate-800">
                        {t('empty.title')}
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        {t('empty.description')}
                    </p>
                    <Button asChild className="mt-6" variant="default">
                        <Link href="/listings">
                            <Search size={16} className="mr-2" />
                            {t('empty.button')}
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

function FavoriteSkeleton() {
    return (
        <div className="flex flex-col border rounded-xl overflow-hidden border-border bg-card h-full">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 flex flex-col gap-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="mt-2 flex justify-between items-center">
                    <Skeleton className="h-7 w-1/3" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>
        </div>
    );
}
