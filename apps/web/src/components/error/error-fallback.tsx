"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface ErrorFallbackProps {
	onReset?: () => void;
}

/**
 * Default error fallback UI displayed when an error is caught by ErrorBoundary.
 * Shows an error message with a reset/retry button.
 */
export function ErrorFallback({ onReset }: ErrorFallbackProps) {
	const { t } = useTranslation("common");

	return (
		<div className="min-h-[400px] flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center space-y-6">
				{/* Error Icon */}
				<div className="flex justify-center">
					<div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
						<AlertCircle className="w-10 h-10 text-destructive" />
					</div>
				</div>

				{/* Error Message */}
				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">
						{t("errorBoundary.title")}
					</h2>
					<p className="text-muted-foreground">
						{t("errorBoundary.description")}
					</p>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					{onReset && (
						<Button onClick={onReset} variant="default" className="gap-2">
							<RefreshCw className="w-4 h-4" />
							{t("errorBoundary.retry")}
						</Button>
					)}
					<Button
						onClick={() => window.location.reload()}
						variant="outline"
						className="gap-2"
					>
						{t("errorBoundary.reload")}
					</Button>
				</div>

				{/* Support Link */}
				<p className="text-sm text-muted-foreground pt-4">
					{t("errorBoundary.support")}{" "}
					<a
						href="mailto:support@kaarplus.ee"
						className="text-primary hover:underline"
					>
						support@kaarplus.ee
					</a>
				</p>
			</div>
		</div>
	);
}
