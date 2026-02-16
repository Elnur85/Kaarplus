import dotenv from "dotenv";

import { createApp } from "./app";
import { logger } from "./utils/logger";
import { initSentry } from "./utils/sentry";

dotenv.config();

// Initialize Sentry before app usage
initSentry();

const PORT = parseInt(process.env.PORT || "4000", 10);

const app = createApp();

app.listen(PORT, () => {
  logger.info(`API server running on http://localhost:${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`Sentry Debug: http://localhost:${PORT}/api/debug-sentry`);
});
