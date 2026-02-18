"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation, Trans } from "react-i18next";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

export function NewsletterSignup() {
    const { toast } = useToast();
    const { t } = useTranslation('home');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const formData = new FormData(e.currentTarget);
            const email = formData.get("email") as string;

            const response = await fetch(`${API_URL}/newsletter/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || t('newsletter.toastError'));
            }

            toast({
                title: t('newsletter.toastSuccess'),
                description: t('newsletter.toastDescription'),
            });

            e.currentTarget.reset();
        } catch (error) {
            toast({
                title: t('common.error', { ns: 'common' }),
                description: error instanceof Error ? error.message : t('newsletter.toastError'),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
            {/* Background Icon Decoration */}
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                <Mail size={300} className="-rotate-12 translate-x-20 translate-y-20" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <h2 className="text-3xl font-bold mb-4">
                    {t('newsletter.title')}
                </h2>
                <p className="text-slate-400 mb-10 max-w-xl mx-auto">
                    {t('newsletter.description')}
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                    <Input
                        type="email"
                        name="email"
                        placeholder={t('newsletter.placeholder')}
                        required
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-4 h-auto rounded-lg bg-white/10 border-white/20 text-white focus:border-primary focus:ring-primary placeholder-slate-500 disabled:opacity-50"
                    />
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-4 h-auto bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            t('newsletter.button')
                        )}
                    </Button>
                </form>
                <p className="mt-6 text-xs text-slate-500">
                    <Trans
                        i18nKey="newsletter.consent"
                        ns="home"
                        components={{
                            privacy: <a href="/privacy" className="underline underline-offset-2" />
                        }}
                    />
                </p>
            </div>
        </section>
    );
}
