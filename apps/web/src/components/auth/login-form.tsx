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
			// Phase 1: Call the proxied login directly to ensure the browser receives the HttpOnly cookie
			// We use the proxy endpoint (/api/v1) so it's same-domain for the browser
			const loginResponse = await fetch("/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});

			const loginData = await loginResponse.json();

			if (!loginResponse.ok) {
				toast({
					variant: "destructive",
					title: t('errors.loginFailed'),
					description: loginData.message || t('errors.loginFailed'),
				})
				return;
			}

			// Phase 2: Now that the cookie is set in the browser, sync with NextAuth
			const result = await signIn("credentials", {
				redirect: false,
				email: values.email,
				password: values.password,
			})

			if (result?.error) {
				toast({
					variant: "destructive",
					title: t('errors.loginFailed'),
				})
				return
			}

			const session = await getSession();
			const role = (session?.user as any)?.role;

			toast({
				variant: "success",
				title: t('success.loggedIn'),
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
