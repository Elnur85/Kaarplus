import { Request, Response } from "express";
import { stripe } from "../utils/stripe";
import { prisma } from "@kaarplus/database";
import { emailService } from "../services/emailService";
import Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Stripe webhook handler.
 */
export async function handleStripeWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        if (!sig || !webhookSecret) {
            console.error("[Stripe Webhook] Missing signature or secret");
            return res.status(400).send("Webhook Error: Missing signature or secret");
        }

        event = stripe.webhooks.constructEvent(req.rawBody!, sig, webhookSecret);
    } catch (err: any) {
        console.error(`[Stripe Webhook] Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            await handlePaymentSuccess(paymentIntent);
            break;
        default:
            console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const { listingId, buyerId, sellerId } = paymentIntent.metadata;

    if (!listingId || !buyerId || !sellerId) {
        console.error("[Stripe Webhook] Missing metadata in payment intent", paymentIntent.id);
        return;
    }

    try {
        // Use a transaction to ensure all updates succeed or fail together
        await prisma.$transaction(async (tx) => {
            // 1. Update listing status
            await tx.listing.update({
                where: { id: listingId },
                data: { status: "SOLD" }
            });

            // 2. Create payment record
            await tx.payment.create({
                data: {
                    listingId,
                    buyerId,
                    sellerId,
                    amount: paymentIntent.amount / 100,
                    currency: "EUR",
                    stripePaymentId: paymentIntent.id,
                    status: "COMPLETED",
                    completedAt: new Date()
                }
            });
        });

        // 3. Send emails (async, non-blocking)
        const [buyer, seller, listing] = await Promise.all([
            prisma.user.findUnique({ where: { id: buyerId } }),
            prisma.user.findUnique({ where: { id: sellerId } }),
            prisma.listing.findUnique({ where: { id: listingId } })
        ]);

        if (buyer?.email && listing) {
            emailService.sendPurchaseConfirmationEmail(
                buyer.email,
                `${listing.year} ${listing.make} ${listing.model}`,
                listing.id
            ).catch(err => console.error("Failed to send buyer email:", err));
        }

        if (seller?.email && listing) {
            emailService.sendSaleNotificationEmail(
                seller.email,
                `${listing.year} ${listing.make} ${listing.model}`,
                listing.id
            ).catch(err => console.error("Failed to send seller email:", err));
        }

        console.log(`[Stripe Webhook] Successfully processed payment ${paymentIntent.id} for listing ${listingId}`);
    } catch (error) {
        console.error(`[Stripe Webhook] Failed to process payment success:`, error);
        throw error; // Let Express handle it
    }
}
