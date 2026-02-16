"use client";

import { Button } from "@/components/ui/button";

export default function SentryTestPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold">Sentry Test</h1>
            <Button
                variant="destructive"
                onClick={() => {
                    throw new Error("Sentry Client Test Error!");
                }}
            >
                Throw Client Error
            </Button>
            <p className="text-muted-foreground">
                Clicking this button should send an error to Sentry.
            </p>
        </div>
    );
}
