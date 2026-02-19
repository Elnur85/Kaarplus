"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, ArrowRight } from "lucide-react";

export function LoginRequiredState() {
    const { t } = useTranslation('sell');

    return (
        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
            <CardContent className="p-12 text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">
                        {t('loginRequired.title', 'Logi sisse, et müüa')}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {t('loginRequired.description', 'Kuulutuse lisamiseks pead olema sisseloginud. See võtab ainult minuti ja on täiesti tasuta.')}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button asChild size="lg" className="gap-2">
                        <Link href="/login?callbackUrl=/sell">
                            {t('loginRequired.loginButton', 'Logi sisse')}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/register">
                            {t('loginRequired.registerButton', 'Registreeru')}
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
