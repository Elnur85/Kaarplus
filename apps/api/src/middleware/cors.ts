import cors from "cors";

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

// Always allow the production Vercel domain as a fallback
const productionOrigins = ["https://kaarplus-web.vercel.app", "https://kaarplus.ee"];
allowedOrigins.push(...productionOrigins);

// In development, automatically allow 127.0.0.1 as an alias for localhost (and vice versa).
// Next.js rewrites forward the browser's Origin header, and dev tools often use 127.0.0.1.
if (process.env.NODE_ENV !== "production") {
	const devAliases = allowedOrigins
		.flatMap((o) => [
			o.replace("localhost", "127.0.0.1"),
			o.replace("127.0.0.1", "localhost"),
		])
		.filter((o) => !allowedOrigins.includes(o));
	allowedOrigins.push(...devAliases);
}

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
