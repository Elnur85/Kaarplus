"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

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

function ResetPasswordFormContent() {
    const { t } = useTranslation("auth");
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isInvalidToken, setIsInvalidToken] = useState(false);

    const resetPasswordSchema = z.object({
        newPassword: z
            .string()
            .min(8, t("resetPassword.validation.minLength"))
            .regex(/[A-Z]/, t("resetPassword.validation.uppercase"))
            .regex(/[0-9]/, t("resetPassword.validation.number")),
        confirmPassword: z.string(),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: t("resetPassword.validation.mismatch"),
        path: ["confirmPassword"],
    });

    type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

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
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword: values.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || t("resetPassword.toastErrorDesc"));
            }

            setIsSuccess(true);
            toast({
                title: t("resetPassword.toastSuccess"),
                description: t("resetPassword.toastSuccessDesc"),
            });

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t("resetPassword.toastErrorDesc");
            toast({
                variant: "destructive",
                title: t("resetPassword.toastError"),
                description: message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isInvalidToken) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">{t("resetPassword.invalidLinkTitle")}</CardTitle>
                    <CardDescription className="text-center">
                        {t("resetPassword.invalidLinkDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {t("resetPassword.invalidLinkAlert")}
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="outline" onClick={() => router.push("/forgot-password")}>
                        {t("resetPassword.requestNewLink")}
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
                        {t("resetPassword.successTitle")}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t("resetPassword.successDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>{t("resetPassword.redirecting")}</p>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="outline" onClick={() => router.push("/login")}>
                        {t("resetPassword.goToLogin")}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">{t("resetPassword.title")}</CardTitle>
                <CardDescription className="text-center">
                    {t("resetPassword.description")}
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
                                    <FormLabel>{t("resetPassword.newPassword")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder={t("resetPassword.newPasswordPlaceholder")}
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
                                    <FormLabel>{t("resetPassword.confirmPassword")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder={t("resetPassword.confirmPasswordPlaceholder")}
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
                                    {t("resetPassword.submitting")}
                                </>
                            ) : (
                                t("resetPassword.submit")
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <a href="/login" className="text-sm text-primary hover:underline">
                    {t("resetPassword.backToLogin")}
                </a>
            </CardFooter>
        </Card>
    );
}

export function ResetPasswordForm() {
    const { t } = useTranslation("auth");
    return (
        <Suspense fallback={
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">{t("resetPassword.title")}</CardTitle>
                    <CardDescription className="text-center">{t("resetPassword.loading")}</CardDescription>
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
