"use client";

import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

export function SellHero() {
    const { t } = useTranslation("sell");
    return (
        <header className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest animate-pulse">
                <Sparkles size={14} /> {t("hero.badge")}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t("hero.title")} <span className="text-primary italic">{t("hero.titleAccent")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t("hero.description")}
            </p>
        </header>
    );
}
