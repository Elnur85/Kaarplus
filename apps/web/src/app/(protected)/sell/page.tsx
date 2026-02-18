import { Metadata } from "next";
import { SellWizard } from "@/components/sell/sell-wizard";
import { SellHero } from "@/components/sell/sell-hero";
import sellEt from "@/../messages/et/sell.json";

export const metadata: Metadata = {
    title: `${sellEt.hero.title} | Kaarplus`,
    description: sellEt.hero.description,
};

export default function SellPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen py-16">
            <div className="container max-w-4xl px-4">
                <SellHero />
                <SellWizard />
            </div>
        </div>
    );
}
