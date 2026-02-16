"use client";

import { CheckCircle2, FileText, LayoutDashboard, Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Step4ConfirmationProps {
    listingId: string;
}

import { useTranslation } from "react-i18next";

export function Step4Confirmation({ listingId }: Step4ConfirmationProps) {
    const { t } = useTranslation('sell');

    return (
        <div className="py-12 text-center space-y-8">
            <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
                <div className="relative w-full h-full bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
                <h2 className="text-3xl font-extrabold tracking-tight">{t('step4.success')}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    {t('step4.idText', { id: listingId })}
                </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-border/50 max-w-sm mx-auto text-left space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{t('step4.nextSteps.title')}</h3>
                <ul className="space-y-3">
                    {(t('step4.nextSteps.items', { returnObjects: true }) as string[]).map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                            <div className="size-5 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-bold italic">{i + 1}</span>
                            </div>
                            <span>{step}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href={`/listings/${listingId}`}>
                    <Button size="lg" className="w-full sm:w-auto font-bold gap-2">
                        <FileText size={18} /> {t('step4.preview')}
                    </Button>
                </Link>
                <Link href="/dashboard/listings">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold gap-2">
                        <LayoutDashboard size={18} /> {t('step4.myListings')}
                    </Button>
                </Link>
            </div>

            <div className="flex items-center justify-center gap-6 pt-10 border-t">
                <Link href="/sell" className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
                    <Plus size={16} /> {t('step4.addAnother')}
                </Link>
                <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                    <Home size={16} /> {t('step4.backHome')}
                </Link>
            </div>
        </div>
    );
}

