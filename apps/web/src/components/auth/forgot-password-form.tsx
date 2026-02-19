"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/constants";

const forgotPasswordSchema = z.object({
    email: z.string().email({
        message: "Invalid email address.",
    }),
})

export function ForgotPasswordForm() {
    const { t } = useTranslation("auth")
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        setIsLoading(true)
        setSuccess(false)

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Request failed");
            }

            setSuccess(true)
            toast({
                title: t("forgotPassword.emailSent"),
                description: t("forgotPassword.emailSentDescription"),
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: t("forgotPassword.error"),
                description: t("forgotPassword.errorDescription"),
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">{t("forgotPassword.successTitle")}</CardTitle>
                    <CardDescription className="text-center">
                        {t("forgotPassword.successDescription")}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                    <Button variant="outline" onClick={() => setSuccess(false)}>
                        {t("forgotPassword.backToLogin")}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">{t("forgotPassword.title")}</CardTitle>
                <CardDescription className="text-center">
                    {t("forgotPassword.description")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("forgotPassword.email")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("forgotPassword.emailPlaceholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <a href="/login" className="text-sm text-primary hover:underline">
                    {t("forgotPassword.backToLogin")}
                </a>
            </CardFooter>
        </Card>
    )
}
