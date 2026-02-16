import { Metadata } from "next";
import { MessagesPageClient } from "@/components/messages/messages-page-client";

export const metadata: Metadata = {
    title: "Sõnumid | Kaarplus",
    description: "Teie sõnumid ostjate ja müüjatega.",
    robots: { index: false, follow: false },
};

export default function MessagesPage() {
    return <MessagesPageClient />;
}
