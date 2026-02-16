import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
    console.warn("[Stripe] STRIPE_SECRET_KEY is not set. Payments will fail.");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-11-20-preview" as Stripe.StripeConfig["apiVersion"],
    typescript: true,
});
