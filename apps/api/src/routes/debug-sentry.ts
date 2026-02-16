import { Router } from "express";

const router = Router();

router.get("/debug-sentry", function mainHandler(_req, _res) {
    throw new Error("My first Sentry error!");
});

export { router as debugSentryRouter };
