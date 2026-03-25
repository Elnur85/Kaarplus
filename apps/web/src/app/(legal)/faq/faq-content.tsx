"use client";

import { useTranslation } from "react-i18next";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/shared/json-ld";
import { generateFaqJsonLd } from "@/lib/seo";

interface FaqItem {
    question: string;
    answer: string;
}

export function FaqPageContent() {
    const { t } = useTranslation("legal");
    const faqs = t("faq.items", { returnObjects: true }) as FaqItem[];
    const faqJsonLd = generateFaqJsonLd(faqs);

    return (
        <article>
            <JsonLd data={faqJsonLd} />
            <h1 className="text-3xl font-bold tracking-tight mb-2">
                {t("faq.title")}
            </h1>
            <p className="text-muted-foreground mb-8">
                {t("faq.subtitle")}
            </p>

            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left font-medium text-base">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </article>
    );
}
