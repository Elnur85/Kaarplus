import { Request, Response, NextFunction } from "express";
import { stripe } from "../utils/stripe";
import { prisma } from "@kaarplus/database";
import { NotFoundError, BadRequestError } from "../utils/errors";

/**
 * POST /api/payments/create-intent
 * Create a Stripe PaymentIntent for a specific listing.
 */
export async function createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
        const { listingId } = req.body;
        const userId = req.user!.id;

        if (!listingId) {
            throw new BadRequestError("listingId is required");
        }

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: { user: true }
        });

        if (!listing) {
            throw new NotFoundError("Listing not found");
        }

        if (listing.status !== "ACTIVE") {
            throw new BadRequestError("Listing is not available for purchase");
        }

        if (listing.userId === userId) {
            throw new BadRequestError("You cannot purchase your own listing");
        }

        // Stripe expects amounts in cents/subunits
        const amount = Math.round(Number(listing.price) * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "eur",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                listingId: listing.id,
                buyerId: userId,
                sellerId: listing.userId
            },
        });

        res.json({
            data: {
                clientSecret: paymentIntent.client_secret,
                amount: listing.price,
                currency: "EUR"
            }
        });
    } catch (error) {
        next(error);
    }
}
