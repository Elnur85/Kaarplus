import cors from "cors";

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

// Always allow the production Vercel domain as a fallback
const productionOrigins = ["https://kaarplus-web.vercel.app", "https://kaarplus.ee"];
allowedOrigins.push(...productionOrigins);

export const corsOptions = {
	origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
		// Log for debugging (remove in high-traffic production if too noisy)
		if (process.env.NODE_ENV !== "production") {
			console.log(`[CORS] Incoming origin: ${origin}`);
		}

		if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
			return callback(null, true);
		}

		console.error(`[CORS] Rejected: ${origin}. Allowed: ${allowedOrigins.join(", ")}`);
		callback(new Error(`CORS blocked: ${origin}`));
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

export const corsMiddleware = cors(corsOptions);
