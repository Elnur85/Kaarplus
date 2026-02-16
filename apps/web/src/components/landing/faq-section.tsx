"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/shared/json-ld";
import { generateFaqJsonLd } from "@/lib/seo";
import { useTranslation } from "react-i18next";

export function FaqSection() {
    const { t } = useTranslation('home');
    const faqs = t('faq.items', { returnObjects: true }) as { question: string, answer: string }[];

    const faqJsonLd = generateFaqJsonLd(faqs);

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <JsonLd data={faqJsonLd} />
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">
                        {t('faq.title')}
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        {t('faq.subtitle')}
                    </p>
                </div>
                <div className="mx-auto max-w-3xl bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-slate-100 dark:border-slate-700">
                                <AccordionTrigger className="text-left font-semibold text-base hover:text-primary transition-colors py-5">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-500 dark:text-slate-400 leading-relaxed pb-5">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}

