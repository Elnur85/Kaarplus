"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Bookmark, Loader2, CheckCircle2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFilterStore } from "@/store/use-filter-store";
import { API_URL } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

import { useTranslation } from "react-i18next";

interface SaveSearchModalProps {
    trigger?: React.ReactNode;
}

export function SaveSearchModal({ trigger }: SaveSearchModalProps) {
    const { t } = useTranslation('search');
    const { data: session } = useSession();
    const filters = useFilterStore();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSave = async () => {
        if (!session) {
            toast({
                title: t('saveSearch.errors.loginRequired.title'),
                description: t('saveSearch.errors.loginRequired.description'),
                variant: "destructive",
            });
            return;
        }

        if (!name.trim()) {
            toast({
                title: t('saveSearch.errors.nameMissing.title'),
                description: t('saveSearch.errors.nameMissing.description'),
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Extract only relevant filter values
            const activeFilters: any = {};
            const filterKeys = Object.keys(filters) as Array<keyof typeof filters>;

            filterKeys.forEach((key) => {
                const value = filters[key];
                if (
                    value !== "" &&
                    value !== "none" &&
                    value !== "all" &&
                    key !== "page" &&
                    key !== "setFilter" &&
                    key !== "resetFilters" &&
                    key !== "setPage" &&
                    key !== "toggleFuelType" &&
                    key !== "toggleBodyTypeCategory" &&
                    key !== "toggleBodyTypeSubtype" &&
                    key !== "isCategorySelected" &&
                    key !== "isSubtypeSelected" &&
                    key !== "getBodyTypeForApi" &&
                    key !== "bodyTypeSelections"
                ) {
                    if (Array.isArray(value)) {
                        if (value.length > 0) activeFilters[key] = value;
                    } else {
                        activeFilters[key] = value;
                    }
                }
            });

            const response = await fetch(`${API_URL}/user/saved-searches`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    filters: activeFilters,
                    emailAlerts,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('saveSearch.errors.saveFailed.default'));
            }

            setIsSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsSuccess(false);
                setName("");
            }, 2000);

            toast({
                title: t('saveSearch.toast.successTitle'),
                description: t('saveSearch.toast.successDescription', { name }),
            });
        } catch (error) {
            console.error("Save search error:", error);
            toast({
                title: t('saveSearch.errors.saveFailed.title'),
                description: error instanceof Error ? error.message : t('saveSearch.errors.saveFailed.default'),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Bookmark size={16} />
                        {t('saveSearch.trigger')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {isSuccess ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{t('saveSearch.successTitle')}</h3>
                            <p className="text-muted-foreground mt-1">
                                {t('saveSearch.successDescription')}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>{t('saveSearch.title')}</DialogTitle>
                            <DialogDescription>
                                {t('saveSearch.description')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('saveSearch.nameLabel')}</Label>
                                <Input
                                    id="name"
                                    placeholder={t('saveSearch.namePlaceholder')}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-medium flex items-center gap-2">
                                        <Bell size={16} className="text-primary" />
                                        {t('saveSearch.emailAlertsLabel')}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('saveSearch.emailAlertsDescription')}
                                    </p>
                                </div>
                                <Switch
                                    checked={emailAlerts}
                                    onCheckedChange={setEmailAlerts}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                        {t('saveSearch.submitting')}
                                    </>
                                ) : (
                                    t('saveSearch.submit')
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

