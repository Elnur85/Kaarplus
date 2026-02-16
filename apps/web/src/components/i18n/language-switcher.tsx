"use client";

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = [
    { code: 'et', name: 'Eesti', flag: '🇪🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        localStorage.setItem('kaarplus-lang', langCode);
        // Update HTML lang attribute
        document.documentElement.lang = langCode;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentLanguage.name}</span>
                    <span className="sm:hidden">{currentLanguage.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="cursor-pointer"
                    >
                        <span className="mr-2">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {i18n.language === lang.code && (
                            <span className="ml-auto text-primary">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
