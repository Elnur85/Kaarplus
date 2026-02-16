import { Router } from "express";

import { handleStripeWebhook } from "../controllers/webhookController";

export const webhooksRouter = Router();

// Stripe webhook (public)
// Note: Signature is verified in the controller
webhooksRouter.post("/stripe", handleStripeWebhook);
