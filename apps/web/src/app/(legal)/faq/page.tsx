import type { Metadata } from "next";
import { FaqPageContent } from "./faq-content";

export const metadata: Metadata = {
    title: "Korduma kippuvad küsimused",
    description: "Kaarplus KKK — vastused kõige sagedamini esitatud küsimustele auto ostmise ja müümise kohta.",
};

export default function FaqPage() {
    return <FaqPageContent />;
}
