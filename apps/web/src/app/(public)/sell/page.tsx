import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SellWizard } from "@/components/sell/sell-wizard";
import { SellHero } from "@/components/sell/sell-hero";
import { LoginRequiredState } from "@/components/sell/login-required-state";
import sellEt from "@/../messages/et/sell.json";

export const metadata: Metadata = {
    title: `${sellEt.hero.title} | Kaarplus`,
    description: sellEt.hero.description,
};

export default async function SellPage() {
    const session = await auth();
    const isAuthenticated = !!session;

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen py-16">
            <div className="container max-w-4xl px-4">
                <SellHero />
                {isAuthenticated ? (
                    <SellWizard />
                ) : (
                    <LoginRequiredState />
                )}
            </div>
        </div>
    );
}
