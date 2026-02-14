import { ListingQueue } from "@/components/admin/listing-queue";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kinnitamise järjekord | Kaarplus Admin",
    description: "Kuulutuste ülevaatamine ja kinnitamine",
};

export default function AdminListingsPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <ListingQueue />
        </div>
    );
}
