"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ConsentState {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
}

interface CookieSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    consent: ConsentState;
    onSave: (consent: ConsentState) => void;
    onRejectAll: () => void;
}

import { useTranslation } from "react-i18next";

export function CookieSettingsModal({
    open,
    onOpenChange,
    consent,
    onSave,
    onRejectAll,
}: CookieSettingsModalProps) {
    const { t } = useTranslation('legal');
    const [localConsent, setLocalConsent] = useState<ConsentState>(consent);

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setLocalConsent(consent);
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">
                        {t('cookies.settingsTitle')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Essential Cookies */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold">
                                    {t('cookies.essential.title')}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] uppercase font-bold"
                                >
                                    {t('cookies.essential.badge')}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('cookies.essential.description')}
                            </p>
                        </div>
                        <Switch checked disabled className="cursor-not-allowed" />
                    </div>

                    <Separator />

                    {/* Analytics Cookies */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <span className="text-sm font-bold block mb-1">
                                {t('cookies.analytics.title')}
                            </span>
                            <p className="text-xs text-muted-foreground">
                                {t('cookies.analytics.description')}
                            </p>
                        </div>
                        <Switch
                            checked={localConsent.analytics}
                            onCheckedChange={(checked) =>
                                setLocalConsent((prev) => ({ ...prev, analytics: checked }))
                            }
                        />
                    </div>

                    <Separator />

                    {/* Marketing Cookies */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <span className="text-sm font-bold block mb-1">
                                {t('cookies.marketing.title')}
                            </span>
                            <p className="text-xs text-muted-foreground">
                                {t('cookies.marketing.description')}
                            </p>
                        </div>
                        <Switch
                            checked={localConsent.marketing}
                            onCheckedChange={(checked) =>
                                setLocalConsent((prev) => ({ ...prev, marketing: checked }))
                            }
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onRejectAll();
                            onOpenChange(false);
                        }}
                        className="text-muted-foreground"
                    >
                        {t('buttons.rejectAll')}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() =>
                            onSave({ ...localConsent, essential: true })
                        }
                    >
                        {t('buttons.savePreferences')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

