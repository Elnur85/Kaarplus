import { Router } from "express";

import { subscribe, unsubscribe } from "../controllers/newsletterController";
import { writeLimiter } from "../middleware/rateLimiter";

export const newsletterRouter = Router();

newsletterRouter.post("/subscribe", writeLimiter, subscribe);
newsletterRouter.get("/unsubscribe", unsubscribe);
