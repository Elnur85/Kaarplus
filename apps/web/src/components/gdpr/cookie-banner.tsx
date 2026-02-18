"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CookieSettingsModal } from "./cookie-settings-modal";
import { cn } from "@/lib/utils";

interface ConsentState {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
}

const CONSENT_STORAGE_KEY = "kaarplus_cookie_consent";
const CONSENT_VERSION = "1.0";

function getStoredConsent(): ConsentState | null {
    if (typeof window === "undefined") return null;
    try {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        if (parsed.version !== CONSENT_VERSION) return null;
        return parsed.consent;
    } catch {
        return null;
    }
}

function saveConsent(consent: ConsentState) {
    if (typeof window === "undefined") return;
    localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({
            version: CONSENT_VERSION,
            consent,
            timestamp: new Date().toISOString(),
        })
    );
}

import { useTranslation } from "react-i18next";

export function CookieBanner() {
    const { t } = useTranslation('legal');
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [consent, setConsent] = useState<ConsentState>(() => {
        const stored = getStoredConsent();
        return stored ?? { essential: true, analytics: false, marketing: false };
    });

    useEffect(() => {
        const stored = getStoredConsent();
        if (!stored) {
            // Small delay so banner doesn't flash on page load
            const timer = setTimeout(() => setIsVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const fullConsent: ConsentState = {
            essential: true,
            analytics: true,
            marketing: true,
        };
        setConsent(fullConsent);
        saveConsent(fullConsent);
        setIsVisible(false);
        submitConsentToApi(fullConsent);
    };

    const handleRejectAll = () => {
        const minimalConsent: ConsentState = {
            essential: true,
            analytics: false,
            marketing: false,
        };
        setConsent(minimalConsent);
        saveConsent(minimalConsent);
        setIsVisible(false);
        submitConsentToApi(minimalConsent);
    };

    const handleSavePreferences = (preferences: ConsentState) => {
        setConsent(preferences);
        saveConsent(preferences);
        setIsVisible(false);
        setShowSettings(false);
        submitConsentToApi(preferences);
    };

    if (!isVisible) return null;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 pointer-events-none">
                <div
                    className={cn(
                        "max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-2xl p-5",
                        "pointer-events-auto flex flex-col md:flex-row items-center gap-6",
                        "animate-in slide-in-from-bottom-5 duration-300"
                    )}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Cookie className="h-5 w-5 text-primary" />
                            <h5 className="font-bold text-foreground">
                                {t('cookies.banner.title')}
                            </h5>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t('cookies.banner.description')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSettings(true)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {t('buttons.customize')}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRejectAll}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {t('buttons.rejectAll')}
                        </Button>
                        <Button
                            onClick={handleAcceptAll}
                            size="sm"
                            className="shadow-lg shadow-primary/20"
                        >
                            {t('buttons.acceptAll')}
                        </Button>
                    </div>
                </div>
            </div>

            <CookieSettingsModal
                open={showSettings}
                onOpenChange={setShowSettings}
                consent={consent}
                onSave={handleSavePreferences}
                onRejectAll={handleRejectAll}
            />
        </>
    );
}


/**
 * Submit consent to backend API (fire-and-forget).
 * Only sends if user is authenticated (token in cookies).
 */
async function submitConsentToApi(consent: ConsentState) {
    try {
        await fetch(`/api/v1/user/gdpr/consent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                marketing: consent.marketing,
                analytics: consent.analytics,
            }),
        });
    } catch {
        // Silent fail — consent is stored locally regardless
    }
}
