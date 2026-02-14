"use client";

import { CheckCircle2, FileText, LayoutDashboard, Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Step4ConfirmationProps {
    listingId: string;
}

export function Step4Confirmation({ listingId }: Step4ConfirmationProps) {
    return (
        <div className="py-12 text-center space-y-8">
            <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
                <div className="relative w-full h-full bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
                <h2 className="text-3xl font-extrabold tracking-tight">Kuulutus on edukalt esitatud!</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    Teie kuulutus (ID: <span className="font-mono font-bold text-foreground">#{listingId}</span>) on nüüd ülevaatusel.
                </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-border/50 max-w-sm mx-auto text-left space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Mis edasi saab?</h3>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                        <div className="size-5 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold italic">1</span>
                        </div>
                        <span>Kontrollime andmed ja fotod üle (tavaliselt 2-4h jooksul).</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                        <div className="size-5 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold italic">2</span>
                        </div>
                        <span>Saadame Teile e-kirja, kui kuulutus on avalik.</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                        <div className="size-5 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold italic">3</span>
                        </div>
                        <span>Kuulutus on aktiivne 30 päeva.</span>
                    </li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href={`/listings/${listingId}`}>
                    <Button size="lg" className="w-full sm:w-auto font-bold gap-2">
                        <FileText size={18} /> Vaata eelvaadet
                    </Button>
                </Link>
                <Link href="/dashboard/listings">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold gap-2">
                        <LayoutDashboard size={18} /> Minu kuulutused
                    </Button>
                </Link>
            </div>

            <div className="flex items-center justify-center gap-6 pt-10 border-t">
                <Link href="/sell" className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
                    <Plus size={16} /> Lisa veel üks sõiduk
                </Link>
                <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                    <Home size={16} /> Tagasi esilehele
                </Link>
            </div>
        </div>
    );
}
