"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("inspection");
    const { data: session } = useSession();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleRequest = async () => {
        if (!session) {
            toast({
                title: t("request.loginRequired"),
                description: t("request.loginRequiredDesc"),
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/user/inspections`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || t("request.requestFailed"));
            }

            setIsSuccess(true);
            toast({
                title: t("request.toastSent"),
                description: t("request.toastSentDesc"),
            });
        } catch (error) {
            toast({
                title: t("request.toastError"),
                description: error instanceof Error ? error.message : t("request.toastErrorDesc"),
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
                    {t("request.button")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {isSuccess ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{t("request.successTitle")}</h3>
                            <p className="text-muted-foreground mt-2">
                                {t("request.successDesc", { title: listingTitle })}
                            </p>
                        </div>
                        <Button asChild className="mt-4" onClick={() => setIsOpen(false)}>
                            <Link href="/dashboard/inspections">{t("request.viewRequests")}</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>{t("request.dialogTitle")}</DialogTitle>
                            <DialogDescription>
                                {t("request.dialogDescription")}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">{t("request.serviceIncludes")}</h4>
                                <ul className="text-sm space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-2 italic">
                                        <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        {t("request.paintThickness")}
                                    </li>
                                    <li className="flex items-start gap-2 italic">
                                        <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        {t("request.diagnostics")}
                                    </li>
                                    <li className="flex items-start gap-2 italic">
                                        <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        {t("request.testDrive")}
                                    </li>
                                    <li className="flex items-start gap-2 italic">
                                        <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        {t("request.historyCheck")}
                                    </li>
                                </ul>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-sm font-medium">{t("request.price")}</span>
                                <span className="text-lg font-bold">79.00 €</span>
                            </div>
                        </div>
                        <DialogFooter>
                            {!session ? (
                                <Button asChild className="w-full">
                                    <Link href={`/auth/login?callbackUrl=/listings/${listingId}`}>{t("request.loginToContinue")}</Link>
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
                                            {t("request.submitting")}
                                        </>
                                    ) : (
                                        t("request.confirm")
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
