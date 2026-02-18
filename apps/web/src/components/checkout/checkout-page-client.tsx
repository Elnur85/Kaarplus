"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./checkout-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingDetailed } from "@/types/listing";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutPageClientProps {
	listing: ListingDetailed;
}

export function CheckoutPageClient({ listing }: CheckoutPageClientProps) {
	const { t, i18n } = useTranslation(['checkout', 'common']);
	const { status } = useSession();
	const router = useRouter();
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const currencyLocale = i18n.language === 'et' ? "et-EE" : i18n.language === 'ru' ? "ru-RU" : "en-US";

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push(`/login?callbackUrl=/listings/${listing.id}/purchase`);
			return;
		}

		if (status === "authenticated") {
			apiFetch("/payments/create-intent", {
				method: "POST",
				body: JSON.stringify({ listingId: listing.id }),
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.error) {
						setError(res.error);
					} else if (res.data?.clientSecret) {
						setClientSecret(res.data.clientSecret);
					}
				})
				.catch((err) => {
					console.error("Failed to create payment intent:", err);
					setError(t('initFailed'));
				});
		}
	}, [status, listing.id, router, t]);

	if (status === "loading" || (status === "authenticated" && !clientSecret && !error)) {
		return (
			<div className="flex flex-col items-center justify-center py-20 gap-4">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-muted-foreground">{t('preparing')}</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container max-w-md py-20">
				<Card className="border-destructive/20 bg-destructive/5">
					<CardHeader>
						<CardTitle className="text-destructive">{t('common.error', { ns: 'common' })}</CardTitle>
						<CardDescription>{error}</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="container max-w-2xl py-12">
			<div className="grid grid-cols-1 md:grid-cols-5 gap-8">
				<div className="md:col-span-3">
					<Card className="shadow-lg border-primary/10">
						<CardHeader className="space-y-1">
							<CardTitle className="text-2xl font-bold">{t('securePayment')}</CardTitle>
							<CardDescription>
								{t('confirmPurchase')}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{clientSecret && (
								<Elements
									stripe={stripePromise}
									options={{
										clientSecret,
										appearance: {
											theme: 'stripe',
											variables: {
												colorPrimary: '#10b77f',
											}
										}
									}}
								>
									<CheckoutForm listingId={listing.id} amount={Number(listing.price)} />
								</Elements>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="md:col-span-2">
					<Card className="bg-muted/30 border-none">
						<CardHeader>
							<CardTitle className="text-lg">{t('summary')}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-3">
								<div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
									{listing.images[0] && (
										<Image
											src={listing.images[0].url}
											alt={listing.make}
											fill
											className="object-cover"
											unoptimized
										/>
									)}
								</div>
								<div>
									<div className="font-bold text-sm">{listing.year} {listing.make} {listing.model}</div>
									<div className="text-xs text-muted-foreground">{listing.location}</div>
								</div>
							</div>

							<div className="border-t pt-4 space-y-2">
								<div className="flex justify-between text-sm">
									<span>{t('price')}</span>
									<span>{Number(listing.price).toLocaleString(currencyLocale)} €</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>{t('serviceFee')}</span>
									<span className="text-green-600">{t('free')}</span>
								</div>
								<div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
									<span>{t('total')}</span>
									<span>{Number(listing.price).toLocaleString(currencyLocale)} €</span>
								</div>
							</div>

							<div className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
								{t('terms')}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
