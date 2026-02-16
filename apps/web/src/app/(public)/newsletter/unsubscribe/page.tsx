"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "" : "Vigane link. Palun kasutage e-kirjas olevat linki."
  );

  useEffect(() => {
    if (!token) return;

    const unsubscribe = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
        );

        if (res.ok) {
          setStatus("success");
          setMessage(
            "Olete edukalt uudiskirjast lahkunud. Ei saada teile enam e-kirju."
          );
        } else {
          const data = await res.json();
          setStatus("error");
          setMessage(
            data.error || "Midagi läks valesti. Palun proovige uuesti."
          );
        }
      } catch {
        setStatus("error");
        setMessage("Ühenduse viga. Palun proovige uuesti.");
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <div className="mx-auto max-w-md text-center">
      {status === "loading" && (
        <div className="space-y-4">
          <Loader2 className="mx-auto size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Palun oodake...</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <CheckCircle className="mx-auto size-16 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Uudiskirjast lahkumine
          </h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <XCircle className="mx-auto size-16 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Viga</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
      )}
    </div>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Suspense fallback={
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Palun oodake...</p>
        </div>
      }>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
