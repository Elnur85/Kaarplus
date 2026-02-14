import { Metadata } from "next";
import { SellWizard } from "@/components/sell/sell-wizard";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
    title: "Müü oma auto | Kaarplus",
    description: "Lisage oma auto müügikuulutus kiiresti ja lihtsalt. Parimad tingimused ja suurim ostjaskond Eestis.",
};

export default function SellPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen py-16">
            <div className="container max-w-4xl px-4">
                <header className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest animate-pulse">
                        <Sparkles size={14} /> 100% Tasuta müük
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Müüge oma auto <span className="text-primary italic">parima hinnaga</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Sisestage andmed, lisage fotod ja leidke ostja juba täna. See võtab vaid 5 minutit.
                    </p>
                </header>

                <SellWizard />
            </div>
        </div>
    );
}
