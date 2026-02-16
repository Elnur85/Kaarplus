"use client";

import { ShieldCheck, Search, Banknote, Award, Verified, MapPin, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ValuePropositions() {
    const { t } = useTranslation('home');
    const features = [
        {
            icon: Verified,
            title: t('valueProps.history.title'),
            description: t('valueProps.history.description'),
        },
        {
            icon: Banknote,
            title: t('valueProps.secure.title'),
            description: t('valueProps.secure.description'),
        },
        {
            icon: MapPin,
            title: t('valueProps.easySearch.title'),
            description: t('valueProps.easySearch.description'),
        },
        {
            icon: Lock,
            title: t('valueProps.trustedSellers.title'),
            description: t('valueProps.trustedSellers.description'),
        },
    ];

    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">{t('valueProps.title', { defaultValue: 'Miks valida Kaarplus?' })}</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">{t('valueProps.subtitle', { defaultValue: 'Pakume kõige turvalisemat ja kiiremat viisi auto ostmiseks või müümiseks Eesti turul.' })}</p>
                </div>
                <div className="grid md:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="p-8 bg-white dark:bg-slate-800 rounded-xl border border-primary/5 hover:shadow-xl transition-all group text-center">
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <feature.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
