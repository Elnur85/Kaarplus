"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { SITE_NAME } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Car, PlusCircle } from "lucide-react";

export function Header() {
  const { t } = useTranslation('common');

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-primary/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg transition-transform group-hover:scale-110">
              <Car className="text-white h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Kaar<span className="text-primary">plus</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/listings" className="font-medium hover:text-primary transition-colors">
              {t('nav.listings')}
            </Link>
            <Link href="/sell" className="font-medium hover:text-primary transition-colors">
              {t('nav.sell')}
            </Link>
            <Link href="/compare" className="font-medium hover:text-primary transition-colors flex items-center gap-1">
              {t('nav.compare')}
            </Link>
          </nav>
        </div>

        {/* Action buttons and language switcher */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium transition-colors hover:text-primary"
          >
            {t('nav.login')}
          </Link>

          <Link
            href="/sell"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-primary/20"
          >
            <PlusCircle size={18} />
            <span className="hidden lg:inline">{t('nav.sell')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
