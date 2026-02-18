import { Metadata } from "next";
import { PurchaseSuccessClient } from "@/components/checkout/purchase-success-client";
import checkoutEt from "@/../messages/et/checkout.json";

export const metadata: Metadata = {
    title: `${checkoutEt.page.success.title} | Kaarplus`,
    robots: { index: false, follow: false },
};

export default function PurchaseSuccessPage() {
    return <PurchaseSuccessClient />;
}
