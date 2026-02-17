"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ListingReviewCard } from "./listing-review-card";
import { RejectReasonModal } from "./reject-reason-modal";
import { Loader2, Inbox, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

import { useTranslation } from "react-i18next";

export function ListingQueue() {
    const { t } = useTranslation('admin');
    const { data: session } = useSession();
    const { toast } = useToast();
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Rejection modal state
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<{ id: string; title: string } | null>(null);

    const fetchPending = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/listings/pending`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error(t('queue.error.message'));
            const result = await res.json();
            setListings(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        if (session?.user) {
            fetchPending();
        }
    }, [session?.user, fetchPending]);

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/listings/${id}/verify`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ action: "approve" }),
            });

            if (!res.ok) throw new Error(t('queue.toasts.error'));

            setListings(prev => prev.filter(l => l.id !== id));
            toast({
                title: t('queue.toasts.approved.title'),
                description: t('queue.toasts.approved.description'),
            });
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: t('queue.toasts.error'),
                description: err.message,
            });
        }
    };

    const handleRejectClick = (id: string, title: string) => {
        setSelectedListing({ id, title });
        setRejectModalOpen(true);
    };

    const handleRejectConfirm = async (reason: string) => {
        if (!selectedListing) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/listings/${selectedListing.id}/verify`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ action: "reject", reason }),
            });

            if (!res.ok) throw new Error(t('queue.toasts.error'));

            setListings(prev => prev.filter(l => l.id !== selectedListing.id));
            setRejectModalOpen(false);
            setSelectedListing(null);

            toast({
                title: t('queue.toasts.rejected.title'),
                description: t('queue.toasts.rejected.description'),
            });
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: t('queue.toasts.error'),
                description: err.message,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground animate-pulse">{t('queue.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-lg mx-auto">
                <AlertCircle className="text-destructive mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-destructive">{t('queue.error.title')}</h3>
                <p className="text-muted-foreground mt-2 mb-6">{error}</p>
                <Button onClick={fetchPending} variant="outline">{t('queue.error.retry')}</Button>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl p-20 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                    <Inbox size={40} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{t('queue.empty.title')}</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-lg leading-relaxed">
                    {t('queue.empty.message')}
                </p>
                <Button variant="outline" className="mt-8" onClick={fetchPending}>{t('queue.empty.refresh')}</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('queue.title')}</h2>
                    <p className="text-muted-foreground mt-1">
                        {t('queue.description', { count: listings.length })}
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchPending}>{t('queue.refresh')}</Button>
            </div>


            <div className="grid gap-4">
                {listings.map((listing) => (
                    <ListingReviewCard
                        key={listing.id}
                        listing={listing}
                        onApprove={handleApprove}
                        onReject={handleRejectClick}
                    />
                ))}
            </div>

            <RejectReasonModal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleRejectConfirm}
                listingTitle={selectedListing?.title || ""}
            />
        </div>
    );
}
