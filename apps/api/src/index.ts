import "dotenv/config";
import { createApp } from "./app";
import { logger } from "./utils/logger";
import { initSentry } from "./utils/sentry";

// Initialize Sentry before app usage
initSentry();

const PORT = parseInt(process.env.PORT || "4000", 10);

const { httpServer } = createApp();

// Process-level error handlers
process.on("unhandledRejection", (reason) => {
	logger.error("Unhandled Promise Rejection", { reason: reason instanceof Error ? reason.message : String(reason) });
});

process.on("uncaughtException", (err) => {
	logger.error("Uncaught Exception — shutting down", { error: err.message, stack: err.stack });
	process.exit(1);
});

httpServer.listen(PORT, () => {
	logger.info(`API server running on http://localhost:${PORT}`);
	logger.info(`Health check: http://localhost:${PORT}/api/health`);
	logger.info(`WebSocket server ready for real-time messaging`);
});
