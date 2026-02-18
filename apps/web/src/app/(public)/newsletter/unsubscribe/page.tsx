"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

function UnsubscribeContent() {
  const { t } = useTranslation("common");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"confirm" | "loading" | "success" | "error">(
    token ? "confirm" : "error"
  );
  const [message, setMessage] = useState("");

  const displayMessage = message || (!token ? t("newsletter.unsubscribe.invalidToken") : "");

  const handleUnsubscribe = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
      );

      if (res.ok) {
        setStatus("success");
        setMessage(t("newsletter.unsubscribe.success"));
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage(
          data.error || t("newsletter.errors.generic")
        );
      }
    } catch {
      setStatus("error");
      setMessage(t("newsletter.errors.connection"));
    }
  };

  return (
    <div className="mx-auto max-w-md text-center">
      {status === "confirm" && (
        <div className="space-y-4">
          <Mail className="mx-auto size-16 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            {t("newsletter.unsubscribe.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("newsletter.unsubscribe.confirm")}
          </p>
          <button
            onClick={handleUnsubscribe}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("newsletter.unsubscribe.button")}
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="space-y-4">
          <Loader2 className="mx-auto size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{t("newsletter.unsubscribe.wait")}</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <CheckCircle className="mx-auto size-16 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            {t("newsletter.unsubscribe.title")}
          </h1>
          <p className="text-muted-foreground">{displayMessage}</p>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <XCircle className="mx-auto size-16 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">{t("newsletter.unsubscribe.error")}</h1>
          <p className="text-muted-foreground">{displayMessage}</p>
        </div>
      )}
    </div>
  );
}

export default function NewsletterUnsubscribePage() {
  const { t } = useTranslation("common");
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Suspense fallback={
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{t("newsletter.unsubscribe.wait")}</p>
        </div>
      }>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
