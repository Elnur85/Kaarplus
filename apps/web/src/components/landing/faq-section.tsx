import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/shared/json-ld";
import { generateFaqJsonLd } from "@/lib/seo";

export function FaqSection() {
    const faqs = [
        {
            question: "Kuidas ma saan oma autot müüa?",
            answer: "Auto müümine Kaarplusis on lihtne. Logige sisse, täitke sõiduki andmed ja lisage fotod. Meie meeskond kontrollib kuulutuse enne avaldamist.",
        },
        {
            question: "Kas Kaarplus pakub garantii?",
            answer: "Me vahendame garantiipakkumisi meie koostööpartneritelt. Kõik sõidukid on läbinud taustakontrolli.",
        },
        {
            question: "Kui palju maksab kuulutuse lisamine?",
            answer: "Eraisikutele on esimese kuulutuse lisamine tasuta. Järgnevad kuulutused maksavad 9.99 €.",
        },
        {
            question: "Kas ma saan autot vahetada?",
            answer: "Jah, paljud müüjad on nõus vahetuspakkumistega. Otsige kuulutusi märkega 'Vahetusvõimalus'.",
        },
    ];

    const faqJsonLd = generateFaqJsonLd(faqs);

    return (
        <section className="container px-4 py-24 md:px-6">
            <JsonLd data={faqJsonLd} />
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Korduma kippuvad küsimused
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Leidke vastused enamlevinud küsimustele.
                </p>
            </div>
            <div className="mx-auto max-w-3xl mt-12 space-y-4 ring-1 ring-border rounded-xl p-6 bg-card">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left font-medium text-lg">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
