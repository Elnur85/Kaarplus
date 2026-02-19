"use client";

import Link from "next/link";
import { ErrorFallback } from "@/components/error/error-fallback";

/**
 * Next.js App Router Error Page
 * Automatically wraps route segments and catches errors in:
 * - Server Components (during SSR)
 * - Client Components (during rendering)
 *
 * This is the root error handler for the entire application.
 */
export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	// Log error for monitoring
	console.error("Root error boundary caught:", error);

	return (
		<div className="min-h-screen bg-background">
			{/* Header placeholder to maintain layout consistency */}
			<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container h-16 flex items-center">
					<Link href="/" className="text-xl font-bold text-foreground">
						Kaarplus
					</Link>
				</div>
			</header>

			{/* Error Content */}
			<main className="container py-12">
				<ErrorFallback onReset={reset} />
			</main>
		</div>
	);
}
