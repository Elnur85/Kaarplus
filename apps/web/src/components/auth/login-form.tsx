"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
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

const loginSchema = z.object({
    email: z.string().email({
        message: "Invalid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
})

export function LoginForm() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useTranslation('auth')
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true)

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: values.email,
                password: values.password,
            })

            if (result?.error) {
                toast({
                    variant: "destructive",
                    title: t('errors.loginFailed'),
                    description: t('errors.loginFailed'),
                })
                return
            }

            toast({
                title: t('success.loggedIn'),
                description: t('success.loggedIn'),
            })
            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            toast({
                variant: "destructive",
                title: t('errors.somethingWrong'),
                description: t('errors.somethingWrong'),
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">{t('login.title')}</CardTitle>
                <CardDescription className="text-center">
                    {t('login.subtitle')}
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
                                    <FormLabel>{t('login.email')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('login.password')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? t('login.loading') : t('login.submit')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <div className="text-sm text-muted-foreground text-center">
                    {t('login.noAccount')}{" "}
                    <a href="/register" className="text-primary hover:underline">
                        {t('login.register')}
                    </a>
                </div>
                <div className="text-center text-sm">
                    <a href="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors">
                        {t('login.forgotPassword')}
                    </a>
                </div>
            </CardFooter>
        </Card>
    )
}
