import { Router } from "express";

import { createPaymentIntent } from "../controllers/paymentController";
import { requireAuth } from "../middleware/auth";
import { writeLimiter } from "../middleware/rateLimiter";

export const paymentsRouter = Router();

// Create payment intent (authenticated)
paymentsRouter.post("/create-intent", requireAuth, writeLimiter, createPaymentIntent);
