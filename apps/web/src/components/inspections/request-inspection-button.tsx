"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ClipboardCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { API_URL } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface RequestInspectionButtonProps {
    listingId: string;
    listingTitle: string;
}

export function RequestInspectionButton({ listingId, listingTitle }: RequestInspectionButtonProps) {
    const { data: session } = useSession();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleRequest = async () => {
        if (!session) {
            toast({
                title: "Vajalik sisselogimine",
                description: "Kontrolli tellimiseks peate olema sisse logitud.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/user/inspections`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Taotlemine ebaõnnestus.");
            }

            setIsSuccess(true);
            toast({
                title: "Taotlus saadetud",
                description: "Meie tehnik võtab teiega peagi ühendust.",
            });
        } catch (error) {
            toast({
                title: "Viga",
                description: error instanceof Error ? error.message : "Tekkis viga taotluse saatmisel.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 font-bold h-11 border-primary/20 hover:bg-primary/5 text-primary">
                    <ClipboardCheck size={18} />
                    Telli tehniline kontroll
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {isSuccess ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Taotlus vastu võetud!</h3>
                            <p className="text-muted-foreground mt-2">
                                Oleme saanud teie soovi kontrollida sõidukit <strong>{listingTitle}</strong>.
                                Võtame teiega ühendust 24 tunni jooksul.
                            </p>
                        </div>
                        <Button asChild className="mt-4" onClick={() => setIsOpen(false)}>
                            <Link href="/dashboard/inspections">Vaata minu taotlusi</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Telli tehniline kontroll</DialogTitle>
                            <DialogDescription>
                                Meie professionaalne tehnik kontrollib sõiduki üle ja koostab põhjaliku raporti.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">Teenus sisaldab:</h4>
                                <ul className="text-sm space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-2 italic">
                                        <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        Värvikihi paksuse mõõtmine
                                    </li>
                                    <li className="flex items-start gap-2 italic">
                                        <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        Arvuti-diagnostika (veakoodid)
                                    </li>
                                    <li className="flex items-start gap-2 italic">
                                        <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        Proovisõit ja veermiku kontroll
                                    </li>
                                    <li className="flex items-start gap-2 italic">
                                        <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        Ajaloo ja läbisõidu kontroll
                                    </li>
                                </ul>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-sm font-medium">Teenuse hind:</span>
                                <span className="text-lg font-bold">79.00 €</span>
                            </div>
                        </div>
                        <DialogFooter>
                            {!session ? (
                                <Button asChild className="w-full">
                                    <Link href={`/auth/login?callbackUrl=/listings/${listingId}`}>Logi sisse, et jätkata</Link>
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleRequest}
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="mr-2 animate-spin" />
                                            Saatmine...
                                        </>
                                    ) : (
                                        "Kinnita ja saada taotlus"
                                    )}
                                </Button>
                            )}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
