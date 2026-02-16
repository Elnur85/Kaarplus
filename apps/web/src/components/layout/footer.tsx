"use client";

import Link from "next/link";
import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_NAME, API_URL } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Tellimine ebaõnnestus.");
      }

      setIsSuccess(true);
      setEmail("");
      toast({
        title: "Tellimine õnnestus!",
        description: "Olete nüüd lisatud meie uudiskirja nimekirja.",
      });
    } catch (error) {
      toast({
        title: "Viga",
        description: error instanceof Error ? error.message : "Tekkis viga uudiskirjaga liitumisel.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="border-t bg-muted/30 pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 mb-16">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="text-2xl font-black tracking-tighter text-primary">
              {SITE_NAME.toUpperCase()}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Kaarplus on Eesti suurim ja usaldusväärseim autode ost-müügi platvorm. Aitame teil leida unistuste auto turvaliselt ja kiirelt.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Teenused</h3>
            <nav className="flex flex-col space-y-3 text-sm text-muted-foreground">
              <Link href="/listings" className="hover:text-primary transition-colors">Kõik kuulutused</Link>
              <Link href="/sell" className="hover:text-primary transition-colors">Müü oma auto</Link>
              <Link href="/search" className="hover:text-primary transition-colors">Täppisotsing</Link>
              <Link href="/inspections" className="hover:text-primary transition-colors">Tehniline kontroll</Link>
            </nav>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Ettevõttest</h3>
            <nav className="flex flex-col space-y-3 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-primary transition-colors">Meist</Link>
              <Link href="/faq" className="hover:text-primary transition-colors">KKK</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Kasutustingimused</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privaatsuspoliitika</Link>
            </nav>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Liitu uudiskirjaga</h3>
            <p className="text-sm text-muted-foreground">
              Saa parimad pakkumised ja automaailma uudised otse oma postkasti.
            </p>
            {isSuccess ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                <CheckCircle2 size={20} />
                <span className="text-sm font-medium">Uudiskiri tellitud!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="teie@email.ee"
                    type="email"
                    className="h-11 bg-card border-border/50 focus:border-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Liitudes nõustute meie privaatsustingimustega.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. Kõik õigused kaitstud.</p>
          <div className="flex gap-6">
            <Link href="/facebook" className="hover:text-primary transition-colors">Facebook</Link>
            <Link href="/instagram" className="hover:text-primary transition-colors">Instagram</Link>
            <Link href="/linkedin" className="hover:text-primary transition-colors">LinkedIn</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
