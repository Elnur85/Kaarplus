import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function initSentry() {
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            integrations: [
                nodeProfilingIntegration(),
                // Add express integration if needed explicitly, but usually auto-discovered
                // or configure http integration
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0, // Capture 100% of the transactions
            // Set sampling rate for profiling
            profilesSampleRate: 1.0,
            environment: process.env.NODE_ENV || "development",
        });
        console.log("Sentry initialized");
    } else {
        console.warn("Sentry DSN not found, skipping initialization.");
    }
}
