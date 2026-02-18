import { DealershipProfile } from "@/components/dealership/dealership-profile";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import dealershipEt from "@/../messages/et/dealership.json";

interface Props {
    params: Promise<{ id: string }>;
}

async function getDealership(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dealerships/${id}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("Failed to fetch dealership:", error);
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const dealership = await getDealership(id);
    if (!dealership) return { title: `${dealershipEt.metadata.notFound} | Kaarplus` };

    return {
        title: `${dealership.name} | ${dealershipEt.badges.official} Kaarplus`,
        description: dealership.bio || dealershipEt.metadata.ogDescription.replace("{name}", dealership.name),
        openGraph: {
            images: dealership.image ? [dealership.image] : [],
        },
    };
}


export default async function DealershipPage({ params }: Props) {
    const { id } = await params;
    const data = await getDealership(id);

    if (!data) notFound();

    return <DealershipProfile dealership={data} listings={data.listings} />;
}
