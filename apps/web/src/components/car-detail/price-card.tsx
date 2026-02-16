"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, CreditCard, MessageSquare } from "lucide-react";
import { PriceDisplay } from "@/components/shared/price-display";
import { cn } from "@/lib/utils";

interface PriceCardProps {
    listingId: string;
    price: number;
    includeVat: boolean;
    status?: string;
    isFavorited?: boolean;
}

export function PriceCard({ listingId, price, includeVat, status, isFavorited }: PriceCardProps) {
    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">
                        Hea hind
                    </Badge>
                    <div className="mt-2">
                        <PriceDisplay price={price} includeVat={includeVat} size="lg" />
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">
                            {includeVat ? "KM-ga" : "Ilma KM-ta"}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-muted-foreground text-xs line-through">
                        {new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price * 1.05)}
                    </div>
                    <div className="text-primary text-xs font-bold">-{new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price * 0.05)}</div>
                </div>
            </div>

            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                Suurepärane valik! <span className="font-semibold text-foreground">Säästa turuhinnaga võrreldes</span>
            </p>

            <div className="space-y-3">
                <Button asChild className="w-full h-12 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2">
                    <Link href={`/listings/${listingId}/purchase`}>
                        <CreditCard size={18} /> Osta kohe
                    </Link>
                </Button>
                <Button variant="outline" className="w-full h-12 border-2 text-primary border-primary hover:bg-primary/5 font-bold gap-2">
                    <MessageSquare size={18} /> Võta müüjaga ühendust
                </Button>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <Button variant="outline" className="flex-1 gap-2 text-xs font-semibold h-10">
                    <Share2 size={16} /> Jaga
                </Button>
                <Button variant="outline" className="flex-1 gap-2 text-xs font-semibold h-10">
                    <Heart size={16} className={cn(isFavorited && "fill-red-500 text-red-500")} /> Salvesta
                </Button>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Turu keskmine</div>
                    <div className="font-bold text-sm">{new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price * 1.02)}</div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Sinu võit</div>
                    <div className="font-bold text-primary text-sm">{new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price * 0.02)}</div>
                </div>
            </div>
        </div>
    );
}
