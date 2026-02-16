import { Router } from "express";

const router = Router();

router.get("/version", (req, res) => {
    res.json({
        platform: "ios",
        minVersion: "1.0.0",
        latestVersion: "1.0.0",
        updateUrl: "https://apps.apple.com/app/kaarplus"
    });
});

export { router as mobileRouter };
