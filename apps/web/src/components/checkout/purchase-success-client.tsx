"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";

export function PurchaseSuccessClient() {
    const { t } = useTranslation("checkout");

    return (
        <div className="container max-w-md py-24">
            <Card className="text-center shadow-2xl border-primary/10 overflow-hidden">
                <div className="h-2 bg-primary" />
                <CardHeader className="pt-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">{t("page.success.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        {t("page.success.description")}
                    </p>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                        {t("page.success.sellerNotification")}
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pb-8">
                    <Button asChild className="w-full font-bold">
                        <Link href="/dashboard/messages">
                            {t("page.success.viewMessages")} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" /> {t("page.success.backHome")}
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
