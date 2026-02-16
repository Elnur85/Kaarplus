"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { SITE_NAME } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export function Header() {
  const { t } = useTranslation('common');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">{SITE_NAME}</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/listings" className="transition-colors hover:text-primary">
            {t('nav.listings')}
          </Link>
          <Link href="/sell" className="transition-colors hover:text-primary">
            {t('nav.sell')}
          </Link>
          <Link href="/compare" className="transition-colors hover:text-primary">
            Võrdle
          </Link>
        </nav>

        {/* Auth buttons and language switcher */}
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('nav.login')}
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t('nav.register')}
          </Link>
        </div>
      </div>
    </header>
  );
}
