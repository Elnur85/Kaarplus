"use client";

import Link from "next/link";
import { useState } from "react";
import { Send, Loader2, CheckCircle2, Car, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_NAME, API_URL } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t('footer.newsletter.toastError'));
      }

      setIsSuccess(true);
      setEmail("");
      toast({
        title: t('footer.newsletter.toastSuccess'),
        description: t('footer.newsletter.toastDescription'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('footer.newsletter.toastError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-1 rounded">
                <Car className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Kaar<span className="text-primary">plus</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-primary hover:border-primary transition-all">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-primary hover:border-primary transition-all">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-primary hover:border-primary transition-all">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase text-xs tracking-[0.2em]">
              {t('footer.services.title')}
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/listings" className="hover:text-primary transition-colors">{t('footer.services.allListings')}</Link></li>
              <li><Link href="/sell" className="hover:text-primary transition-colors">{t('footer.services.sellYourCar')}</Link></li>
              <li><Link href="/listings?fuelType=Electric" className="hover:text-primary transition-colors">{t('footer.services.electricVehicles')}</Link></li>
              <li><Link href="/listings?sort=createdAt_desc" className="hover:text-primary transition-colors">{t('footer.services.newListings')}</Link></li>
              <li><Link href="/inspections" className="hover:text-primary transition-colors">{t('footer.services.inspections')}</Link></li>
            </ul>
          </div>

          {/* ABOUT US */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase text-xs tracking-[0.2em]">
              {t('footer.company.title')}
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/about" className="hover:text-primary transition-colors">{t('footer.company.aboutUs')}</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">{t('footer.company.careers')}</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">{t('footer.company.faq')}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">{t('footer.company.terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">{t('footer.company.privacy')}</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase text-xs tracking-[0.2em]">{t('footer.support.title')}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/help" className="hover:text-primary transition-colors">{t('footer.support.helpCenter')}</Link></li>
              <li><Link href="/safety" className="hover:text-primary transition-colors">{t('footer.support.safetyAdvice')}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t('footer.support.contactSupport')}</Link></li>
              <li><Link href="/fraud" className="hover:text-primary transition-colors">{t('footer.support.fraudProtection')}</Link></li>
              <li><Link href="/sitemap" className="hover:text-primary transition-colors">{t('footer.support.sitemap')}</Link></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Kaarplus. {t('footer.allRightsReserved')}.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">{t('footer.company.privacy')}</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">{t('footer.company.cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

