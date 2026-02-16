"use client";

import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface NewsletterSignupProps {
  className?: string;
}

export function NewsletterSignup({ className }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("et");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Palun sisestage kehtiv e-posti aadress.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, language }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError("See e-posti aadress on juba registreeritud.");
        } else {
          setError(data.error || "Midagi läks valesti. Palun proovige uuesti.");
        }
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("Ühenduse viga. Palun proovige uuesti.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <section
        className={cn(
          "rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 px-6 py-12 text-center",
          className
        )}
      >
        <div className="mx-auto max-w-md space-y-4">
          <CheckCircle className="mx-auto size-12 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">
            Täname! Olete edukalt liitunud meie uudiskirjaga.
          </h3>
          <p className="text-sm text-muted-foreground">
            Saadame teile parimad pakkumised ja uudised.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 px-6 py-12",
        className
      )}
    >
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/15">
            <Mail className="size-7 text-primary" />
          </div>
        </div>

        <h3 className="mb-2 text-2xl font-bold text-foreground">
          Liitu uudiskirjaga
        </h3>
        <p className="mb-8 text-muted-foreground">
          Saage esimesena teada uutest pakkumistest ja autoturul toimuvast.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <Input
            type="email"
            placeholder="teie@email.ee"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="h-11 flex-1 bg-background"
            disabled={isLoading}
          />

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-11 w-full bg-background sm:w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="et">Eesti</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" size="lg" className="h-11" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Mail className="mr-2 size-4" />
            )}
            Liitu
          </Button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}
      </div>
    </section>
  );
}
