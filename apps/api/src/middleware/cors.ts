import cors from "cors";

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

export const corsOptions = {
	origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
		if (!origin) return callback(null, true);
		if (allowedOrigins.includes(origin)) return callback(null, true);
		callback(new Error(`CORS blocked: ${origin}`));
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

export const corsMiddleware = cors(corsOptions);
