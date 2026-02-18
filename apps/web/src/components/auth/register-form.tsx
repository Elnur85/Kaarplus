"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Loader2 } from "lucide-react"

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



const registerSchema = z.object({
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	email: z.string().email({
		message: "Invalid email address.",
	}),
	password: z.string().min(8, {
		message: "Password must be at least 8 characters.",
	}).regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[0-9]/, "Password must contain at least one number"),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match.",
	path: ["confirmPassword"],
})

export function RegisterForm() {
	const router = useRouter()
	const { toast } = useToast()
	const { t } = useTranslation('auth')
	const [isLoading, setIsLoading] = useState(false)

	const form = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	})

	async function onSubmit(values: z.infer<typeof registerSchema>) {
		setIsLoading(true)

		try {
			// Phase 1: Call registration through the proxy to ensure browser receives HttpOnly cookies
			const response = await fetch("/api/v1/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: values.name,
					email: values.email,
					password: values.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || data.message || t('errors.registerFailed'));
			}

			toast({
				title: t('success.registered'),
			})

			const result = await signIn("credentials", {
				redirect: false,
				email: values.email,
				password: values.password,
			});

			if (result?.error) {
				router.push("/login")
			} else {
				router.push("/dashboard")
			}
			router.refresh()

		} catch (error: any) {
			toast({
				variant: "destructive",
				title: t('errors.somethingWrong'),
				description: error.message || t('errors.somethingWrong'),
			})
		} finally {
			setIsLoading(false)
		}
	}

	const inputClassName = "px-4 py-2 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800"

	return (
		<div className="w-full max-w-[400px] mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800">
			{/* Title */}
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('register.title')}</h2>
				<p className="text-sm text-slate-500 mt-1">{t('register.subtitle')}</p>
			</div>

			{/* Form */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('register.name')}</FormLabel>
								<FormControl>
									<Input placeholder={t("register.namePlaceholder")} className={inputClassName} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('register.email')}</FormLabel>
								<FormControl>
									<Input placeholder={t("register.emailPlaceholder")} className={inputClassName} {...field} />
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
								<FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('register.password')}</FormLabel>
								<FormControl>
									<Input type="password" placeholder={t("register.passwordPlaceholder")} className={inputClassName} {...field} />
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
								<FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('register.confirmPassword')}</FormLabel>
								<FormControl>
									<Input type="password" placeholder={t("register.passwordPlaceholder")} className={inputClassName} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Terms Checkbox */}
					<div className="pt-2">
						<label className="flex items-start space-x-3 cursor-pointer">
							<Checkbox className="mt-1 border-slate-300 text-primary" />
							<span className="text-sm text-slate-600 dark:text-slate-400">
								{t('register.agreeToTerms')}{" "}
								<a href="/terms" className="text-primary hover:underline">{t('register.termsLink')}</a>{" "}
								{t('register.and')}{" "}
								<a href="/privacy" className="text-primary hover:underline">{t('register.privacyLink')}</a>.
							</span>
						</label>
					</div>

					<Button
						className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg mt-4 shadow-sm shadow-primary/20 transition-colors"
						type="submit"
						disabled={isLoading}
					>
						{isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
						{isLoading ? t('register.loading') : t('register.submit')}
					</Button>
				</form>
			</Form>

			{/* Login Link */}
			<p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
				{t('register.hasAccount')}{" "}
				<a href="/login" className="text-primary font-semibold hover:underline">
					{t('register.login')}
				</a>
			</p>
		</div>
	)
}
