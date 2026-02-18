import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY && process.env.NODE_ENV === "production") {
    console.warn("[Stripe] STRIPE_SECRET_KEY is not set. Payments will fail.");
}

// If secret key is missing (dev mode), use a placeholder to prevent app crash
// Actual API calls will still fail, but the server will start.
export const stripe = new Stripe(STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2024-11-20-preview" as Stripe.StripeConfig["apiVersion"],
    typescript: true,
});
