"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, CreditCard } from "lucide-react";
import { PriceDisplay } from "@/components/shared/price-display";
import { ShareButton } from "@/components/shared/share-button";
import { ContactSellerDialog } from "@/components/car-detail/contact-seller-dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useFavoritesStore } from "@/store/use-favorites-store";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

interface PriceCardProps {
	listingId: string;
	listingTitle: string;
	price: number;
	includeVat: boolean;
	status?: string;
	isFavorited?: boolean;
}

export function PriceCard({
	listingId,
	listingTitle,
	price,
	includeVat,
	status,
	isFavorited: initialIsFavorited
}: PriceCardProps) {
	const { t, i18n } = useTranslation('carDetail');
	const { toast } = useToast();
	const { data: session } = useSession();
	const isAuthenticated = !!session;

	const { favoriteIds, toggleFavorite, loadFavorites, isLoaded } = useFavoritesStore();
	const isFavorited = favoriteIds.has(listingId);

	// Load favorites on mount only when authenticated
	useEffect(() => {
		if (isAuthenticated && !isLoaded) {
			loadFavorites();
		}
	}, [isAuthenticated, isLoaded, loadFavorites]);

	const currencyLocale = i18n.language === 'et' ? "et-EE" : i18n.language === 'ru' ? "ru-RU" : "en-US";

	const formatCurrency = (val: number) => {
		return new Intl.NumberFormat(currencyLocale, {
			style: "currency",
			currency: "EUR",
			maximumFractionDigits: 0
		}).format(val);
	};

	const handleToggleFavorite = async () => {
		if (!isAuthenticated) {
			toast({
				title: t("favorites.loginRequired"),
				description: t("favorites.loginRequiredDesc"),
				variant: "destructive",
			});
			return;
		}

		try {
			await toggleFavorite(listingId);

			toast({
				title: isFavorited ? t("favorites.removed") : t("favorites.added"),
				description: isFavorited ? t("favorites.removedDesc") : t("favorites.addedDesc"),
			});
		} catch (error) {
			toast({
				title: t("favorites.error"),
				description: error instanceof Error ? error.message : t("favorites.error"),
				variant: "destructive",
			});
		}
	};

	const shareUrl = `/listings/${listingId}`;

	return (
		<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
			<div className="flex items-start justify-between">
				<div>
					<Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">
						{t('priceCard.goodPrice')}
					</Badge>
					<div className="mt-2">
						<PriceDisplay price={price} includeVat={includeVat} size="lg" />
						<p className="text-[10px] text-slate-500 uppercase mt-1">
							{includeVat ? t('priceCard.withVat') : t('priceCard.withoutVat')}
						</p>
					</div>
				</div>
				<div className="text-right">
					<div className="text-slate-400 text-xs line-through">
						{formatCurrency(price * 1.05)}
					</div>
					<div className="text-primary text-xs font-bold">-{formatCurrency(price * 0.05)}</div>
				</div>
			</div>

			<p className="text-slate-500 text-sm flex items-center gap-1.5">
				{t('priceCard.excellentChoice')} <span className="font-semibold text-slate-800 dark:text-white">{t('priceCard.saveCompared')}</span>
			</p>

			<div className="space-y-3">
				<Button asChild className="w-full h-12 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 rounded-xl text-white">
					<Link href={`/listings/${listingId}/purchase`}>
						<CreditCard size={18} /> {t('priceCard.buyNow')}
					</Link>
				</Button>
				<ContactSellerDialog
					listingId={listingId}
					listingTitle={listingTitle}
				/>
			</div>

			<div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
				<ShareButton
					title={listingTitle}
					url={shareUrl}
					description={t('share.listingDescription', { title: listingTitle })}
					variant="outline"
					className="flex-1 h-10 text-xs font-semibold border-slate-200 dark:border-slate-800 rounded-lg"
					showLabel={true}
				/>
				<Button
					variant="outline"
					className={cn(
						"flex-1 gap-2 text-xs font-semibold h-10 border-slate-200 dark:border-slate-800 rounded-lg transition-colors",
						isFavorited && "border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:bg-red-950"
					)}
					onClick={handleToggleFavorite}
				>
					<Heart
						size={16}
						className={cn(
							"transition-all",
							isFavorited && "fill-red-500 text-red-500 scale-110"
						)}
					/>
					{isFavorited ? t('priceCard.saved') : t('priceCard.save')}
				</Button>
			</div>

			<div className="pt-2 grid grid-cols-2 gap-4">
				<div className="text-center">
					<div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{t('priceCard.marketAverage')}</div>
					<div className="font-bold text-sm">{formatCurrency(price * 1.02)}</div>
				</div>
				<div className="text-center">
					<div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{t('priceCard.yourGain')}</div>
					<div className="font-bold text-primary text-sm">{formatCurrency(price * 0.02)}</div>
				</div>
			</div>
		</div>
	);
}
