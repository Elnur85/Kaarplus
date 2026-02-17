"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(8, "Parool peab olema vähemalt 8 tähemärki pikk")
        .regex(/[A-Z]/, "Parool peab sisaldama vähemalt ühte suurt tähte")
        .regex(/[0-9]/, "Parool peab sisaldama vähemalt ühte numbrit"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Paroolid ei kattu",
    path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isInvalidToken, setIsInvalidToken] = useState(false);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (!token) {
            setIsInvalidToken(true);
        }
    }, [token]);

    async function onSubmit(values: ResetPasswordFormValues) {
        if (!token) {
            setIsInvalidToken(true);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword: values.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Parooli lähtestamine ebaõnnestus");
            }

            setIsSuccess(true);
            toast({
                title: "Parool lähtestatud",
                description: "Teie parool on edukalt lähtestatud. Võite nüüd sisse logida.",
            });

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Viga",
                description: error.message || "Parooli lähtestamine ebaõnnestus. Palun proovige uuesti.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isInvalidToken) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Vigane link</CardTitle>
                    <CardDescription className="text-center">
                        Parooli lähtestamise link on vigane või puudub.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Palun taotlege uus parooli lähtestamise link.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="outline" onClick={() => router.push("/forgot-password")}>
                        Taotle uus link
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                        <CheckCircle className="text-green-500" />
                        Parool lähtestatud
                    </CardTitle>
                    <CardDescription className="text-center">
                        Teie parool on edukalt lähtestatud.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>Suuname teid automaatselt sisselogimise lehele...</p>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="outline" onClick={() => router.push("/login")}>
                        Mine sisselogimisele
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Lähtesta parool</CardTitle>
                <CardDescription className="text-center">
                    Sisestage oma uus parool
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Uus parool</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Sisesta uus parool"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kinnita parool</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Kinnita uus parool"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvestan...
                                </>
                            ) : (
                                "Lähtesta parool"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <a href="/login" className="text-sm text-primary hover:underline">
                    Tagasi sisselogimisele
                </a>
            </CardFooter>
        </Card>
    );
}

export function ResetPasswordForm() {
    return (
        <Suspense fallback={
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Lähtesta parool</CardTitle>
                    <CardDescription className="text-center">Laadimine...</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        }>
            <ResetPasswordFormContent />
        </Suspense>
    );
}
