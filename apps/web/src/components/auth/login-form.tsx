"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Zap, Loader2 } from "lucide-react"

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
import { Checkbox } from "@/components/ui/checkbox"
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

            const session = await getSession();
            const role = (session?.user as any)?.role;

            toast({
                title: t('success.loggedIn'),
                description: t('success.loggedIn'),
            })

            if (role === "ADMIN" || role === "SUPPORT") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
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
        <div className="w-full max-w-[400px] mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800">
            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <Zap className="text-white h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('login.title')}</h2>
                <p className="text-sm text-slate-500 mt-1">{t('login.subtitle')}</p>
            </div>

            {/* Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('login.email')}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('login.emailPlaceholder')}
                                        className="px-4 py-2 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800"
                                        {...field}
                                    />
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
                                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('login.password')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder={t('login.passwordPlaceholder')}
                                        className="px-4 py-2 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Remember + Forgot Password */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <Checkbox className="border-slate-300 text-primary" />
                            <span className="text-slate-600 dark:text-slate-400">{t('login.rememberMe')}</span>
                        </label>
                        <a href="/forgot-password" className="text-primary hover:underline font-medium">
                            {t('login.forgotPassword')}
                        </a>
                    </div>

                    <Button
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg shadow-sm shadow-primary/20 transition-colors"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        {isLoading ? t('login.loading') : t('login.submit')}
                    </Button>
                </form>
            </Form>

            {/* Social Divider */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">{t('login.orContinue')}</span>
                </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Google
                </button>
                <button className="flex items-center justify-center px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    Facebook
                </button>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
                {t('login.noAccount')}{" "}
                <a href="/register" className="text-primary font-semibold hover:underline">
                    {t('login.register')}
                </a>
            </p>
        </div>
    )
}
