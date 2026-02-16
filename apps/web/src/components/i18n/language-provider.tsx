"use client";

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Load saved language preference from localStorage
        const savedLang = localStorage.getItem('kaarplus-lang');
        if (savedLang && ['et', 'ru', 'en'].includes(savedLang)) {
            i18n.changeLanguage(savedLang);
        }
    }, []);

    return (
        <I18nextProvider i18n={i18n}>
            {children}
        </I18nextProvider>
    );
}
