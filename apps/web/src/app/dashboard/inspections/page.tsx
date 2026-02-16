import { Metadata } from "next";
import { MyInspectionsList } from "@/components/inspection/my-inspections-list";

export const metadata: Metadata = {
    title: "Minu ülevaatused | Kaarplus",
    description: "Teie tellitud sõiduki ülevaatused.",
    robots: { index: false, follow: false },
};

export default function InspectionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Minu ülevaatused</h1>
                <p className="text-muted-foreground mt-1">Vaadake ja jälgige oma ülevaatuste staatust.</p>
            </div>
            <MyInspectionsList />
        </div>
    );
}
