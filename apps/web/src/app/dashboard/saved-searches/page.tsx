"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
	Bookmark,
	Trash2,
	Bell,
	BellOff,
	ArrowRight,
	Search,
	Loader2,
	Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { API_URL } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { et, enGB, ru } from "date-fns/locale";

interface SavedSearch {
	id: string;
	name: string;
	filters: any;
	emailAlerts: boolean;
	createdAt: string;
}

export default function SavedSearchesPage() {
	const { t, i18n } = useTranslation(['dashboard', 'common']);
	const [searches, setSearches] = useState<SavedSearch[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();

	const currentLocale = i18n.language === 'et' ? et : i18n.language === 'ru' ? ru : enGB;

	const fetchSearches = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetch(`${API_URL}/user/saved-searches`, {
				credentials: "include",
				headers: {
					"Cache-Control": "no-cache"
				}
			});
			if (!response.ok) throw new Error(t('savedSearches.toasts.fetchError'));
			const json = await response.json();
			setSearches(json.data || []);
		} catch (error) {
			console.error("Fetch error:", error);
			toast({
				title: t('common:common.error'),
				description: t('savedSearches.toasts.fetchError'),
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast, t]);

	useEffect(() => {
		fetchSearches();
	}, [fetchSearches]);

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`${API_URL}/user/saved-searches/${id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to delete");

			setSearches(searches.filter(s => s.id !== id));
			toast({
				title: t('savedSearches.toasts.deleteSuccess'),
				description: t('savedSearches.toasts.deleteSuccessDesc'),
			});
		} catch (error) {
			toast({
				title: t('common:common.error'),
				description: t('savedSearches.toasts.deleteError'),
				variant: "destructive",
			});
		}
	};

	const toggleAlerts = async (id: string, currentStatus: boolean) => {
		try {
			const response = await fetch(`${API_URL}/user/saved-searches/${id}`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ emailAlerts: !currentStatus }),
			});
			if (!response.ok) throw new Error("Failed to update");

			setSearches(searches.map(s => s.id === id ? { ...s, emailAlerts: !currentStatus } : s));
			toast({
				title: t('savedSearches.toasts.alertsUpdate'),
				description: !currentStatus ? t('savedSearches.toasts.alertsOn') : t('savedSearches.toasts.alertsOff'),
			});
		} catch (error) {
			toast({
				title: t('common:common.error'),
				description: t('savedSearches.toasts.updateError'),
				variant: "destructive",
			});
		}
	};

	const buildSearchUrl = (filters: any) => {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				params.set(key, value.join(","));
			} else {
				params.set(key, String(value));
			}
		});
		return `/search?${params.toString()}`;
	};

	const renderFilterSummary = (filters: any) => {
		const parts = [];
		if (filters.make) parts.push(filters.make);
		if (filters.model) parts.push(filters.model);
		if (filters.priceMin || filters.priceMax) {
			parts.push(`${filters.priceMin || "0"} - ${filters.priceMax || "..."} €`);
		}
		if (filters.location) parts.push(filters.location);

		return parts.join(" • ") || t('savedSearches.card.allVehicles');
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{t('savedSearches.title')}</h1>
					<p className="text-muted-foreground">{t('savedSearches.description')}</p>
				</div>
				<Bookmark className="text-primary/20 size-8 hidden sm:block" />
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[1, 2, 3, 4].map(i => (
						<Card key={i} className="animate-pulse">
							<CardHeader className="space-y-2">
								<div className="h-5 bg-muted rounded w-3/4" />
								<div className="h-4 bg-muted rounded w-1/2" />
							</CardHeader>
							<CardContent className="h-20 bg-muted/50 rounded-m mx-6" />
							<CardFooter className="justify-between">
								<div className="h-8 bg-muted rounded w-24" />
								<div className="h-8 bg-muted rounded w-24" />
							</CardFooter>
						</Card>
					))}
				</div>
			) : searches.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{searches.map((search) => (
						<Card key={search.id} className="group hover:border-primary/50 transition-colors">
							<CardHeader className="pb-3">
								<div className="flex justify-between items-start gap-2">
									<CardTitle className="text-lg truncate">{search.name}</CardTitle>
									<Dialog>
										<DialogTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
												<Trash2 size={16} />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>{t('savedSearches.delete.title')}</DialogTitle>
												<DialogDescription>
													{t('savedSearches.delete.description', { name: search.name })}
												</DialogDescription>
											</DialogHeader>
											<DialogFooter className="gap-2 sm:gap-0">
												<DialogClose asChild>
													<Button variant="outline">{t('common:common.cancel')}</Button>
												</DialogClose>
												<Button
													variant="destructive"
													onClick={() => handleDelete(search.id)}
												>
													{t('savedSearches.delete.button')}
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</div>
								<CardDescription className="flex items-center gap-1.5">
									<Clock size={12} />
									{t('savedSearches.card.saved', { date: formatDistanceToNow(new Date(search.createdAt), { addSuffix: true, locale: currentLocale }) })}
								</CardDescription>
							</CardHeader>
							<CardContent className="pb-3">
								<div className="bg-muted/30 rounded-lg p-3 text-sm flex flex-wrap gap-2 items-center">
									{renderFilterSummary(search.filters)}
								</div>
							</CardContent>
							<CardFooter className="flex justify-between border-t border-border/50 pt-4 bg-muted/5">
								<div className="flex items-center gap-2">
									<Switch
										id={`alerts-${search.id}`}
										checked={search.emailAlerts}
										onCheckedChange={() => toggleAlerts(search.id, search.emailAlerts)}
									/>
									<label
										htmlFor={`alerts-${search.id}`}
										className="text-xs font-medium cursor-pointer flex items-center gap-1"
									>
										{search.emailAlerts ? <Bell size={12} className="text-primary" /> : <BellOff size={12} />}
										{t('savedSearches.card.alerts')}
									</label>
								</div>
								<Button asChild size="sm" variant="secondary" className="gap-1.5 h-8">
									<Link href={buildSearchUrl(search.filters)}>
										{t('savedSearches.card.view')}
										<ArrowRight size={14} />
									</Link>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="py-20 text-center border rounded-xl bg-card border-dashed">
					<div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
						<Search size={32} />
					</div>
					<h3 className="text-xl font-bold">{t('savedSearches.empty.title')}</h3>
					<p className="text-muted-foreground mt-2 max-w-sm mx-auto">
						{t('savedSearches.empty.description')}
					</p>
					<Button asChild className="mt-8">
						<Link href="/search">{t('savedSearches.empty.button')}</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
