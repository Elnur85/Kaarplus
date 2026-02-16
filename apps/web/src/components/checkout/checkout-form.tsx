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

interface CheckoutFormProps {
    listingId: string;
    amount: number;
}

export function CheckoutForm({ listingId, amount }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
            setMessage(error.message || "Midagi läks valesti.");
            toast({
                title: "Makse ebaõnnestus",
                description: error.message,
                variant: "destructive",
            });
        } else {
            setMessage("Ootamatu viga ilmnes.");
            toast({
                title: "Viga",
                description: "Ootamatu viga ilmnes.",
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
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        `Maksa ${amount.toLocaleString("et-EE")} €`
                    )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck size={16} className="text-green-600" />
                    <span>Turvaline makse krüpteeritud ühendusega</span>
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
