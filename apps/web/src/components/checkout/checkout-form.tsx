"use client";

import { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface CheckoutFormProps {
    listingId: string;
    amount: number;
}

export function CheckoutForm({ listingId, amount }: CheckoutFormProps) {
    const { t, i18n } = useTranslation('checkout');
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const currencyLocale = i18n.language === 'et' ? "et-EE" : i18n.language === 'ru' ? "ru-RU" : "en-US";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/listings/${listingId}/purchase/success`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || t('form.errorOccurred'));
            toast({
                title: t('form.paymentFailed'),
                description: error.message,
                variant: "destructive",
            });
        } else {
            setMessage(t('form.unexpectedError'));
            toast({
                title: t('common.error', { ns: 'common' }),
                description: t('form.unexpectedError'),
                variant: "destructive",
            });
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            <div className="flex flex-col gap-4">
                <Button
                    disabled={isLoading || !stripe || !elements}
                    id="submit"
                    className="w-full h-12 text-lg font-semibold"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('form.paying')}
                        </>
                    ) : (
                        t('form.pay', { amount: amount.toLocaleString(currencyLocale) })
                    )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck size={16} className="text-green-600" />
                    <span>{t('form.secureConnection')}</span>
                </div>
            </div>

            {message && (
                <div id="payment-message" className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium text-center">
                    {message}
                </div>
            )}
        </form>
    );
}
