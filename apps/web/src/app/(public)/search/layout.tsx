import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Täppisotsing | Kaarplus",
    description: "Leidke oma unistuste auto täpsete filtritega. Otsige margi, mudeli, hinna, aasta, kütuse ja paljude muude parameetrite järgi.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return children;
}
