"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./checkout-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingDetailed } from "@/types/listing";
import { API_URL } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutPageClientProps {
    listing: ListingDetailed;
}

export function CheckoutPageClient({ listing }: CheckoutPageClientProps) {
    const { status } = useSession();
    const router = useRouter();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/login?callbackUrl=/listings/${listing.id}/purchase`);
            return;
        }

        if (status === "authenticated") {
            fetch(`${API_URL}/api/payments/create-intent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
                    setError("Makse algatamine ebaõnnestus. Palun proovige uuesti.");
                });
        }
    }, [status, listing.id, router]);

    if (status === "loading" || (status === "authenticated" && !clientSecret && !error)) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Valmistame makset ette...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-md py-20">
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">Viga</CardTitle>
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
                            <CardTitle className="text-2xl font-bold">Turvaline maksmine</CardTitle>
                            <CardDescription>
                                Kinnitage oma ost ja tehke turvaline makse.
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
                                                colorPrimary: '#0ea5e9',
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
                            <CardTitle className="text-lg">Tellimuse kokkuvõte</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                                    {listing.images[0] && (
                                        <img
                                            src={listing.images[0].url}
                                            alt={listing.make}
                                            className="object-cover h-full w-full"
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
                                    <span>Hind</span>
                                    <span>{Number(listing.price).toLocaleString("et-EE")} €</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Teenustasu</span>
                                    <span className="text-green-600">Tasuta</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                    <span>Kokku</span>
                                    <span>{Number(listing.price).toLocaleString("et-EE")} €</span>
                                </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
                                Vajutades &quot;Maksa&quot;, nõustute Kaarplus kasutustingimuste ja privaatsuspoliitikaga.
                                Teie makset töödeldakse turvaliselt läbi Stripe makselahenduse.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
