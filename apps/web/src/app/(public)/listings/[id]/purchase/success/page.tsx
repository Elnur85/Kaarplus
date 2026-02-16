import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";

export const metadata: Metadata = {
    title: "Makse õnnestus | Kaarplus",
    robots: { index: false, follow: false },
};

export default function PurchaseSuccessPage() {
    return (
        <div className="container max-w-md py-24">
            <Card className="text-center shadow-2xl border-primary/10 overflow-hidden">
                <div className="h-2 bg-primary" />
                <CardHeader className="pt-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Makse õnnestus!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Täname ostu eest! Teie makse on edukalt kätte saadud.
                    </p>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                        Müüja on saanud teavituse ja võtab teiega peagi ühendust, et kokku leppida sõiduki üleandmine.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pb-8">
                    <Button asChild className="w-full font-bold">
                        <Link href="/dashboard/messages">
                            Vaata sõnumeid <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" /> Tagasi avalehele
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
