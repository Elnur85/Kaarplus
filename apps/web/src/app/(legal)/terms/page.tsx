"use client";

import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ShieldCheck,
	FileText,
	UserPlus,
	PlusCircle,
	CreditCard,
	AlertTriangle,
	UserX,
	Mail
} from "lucide-react";

export default function TermsPage() {
	const { t } = useTranslation(['legal', 'common']);

	const sections = [
		{
			id: 'description',
			icon: <FileText className="h-6 w-6 text-primary" />,
			title: t('terms.sections.description.title'),
			content: t('terms.sections.description.content')
		},
		{
			id: 'registration',
			icon: <UserPlus className="h-6 w-6 text-blue-500" />,
			title: t('terms.sections.registration.title'),
			items: t('terms.sections.registration.items', { returnObjects: true }) as string[]
		},
		{
			id: 'listings',
			icon: <PlusCircle className="h-6 w-6 text-emerald-500" />,
			title: t('terms.sections.listings.title'),
			items: t('terms.sections.listings.items', { returnObjects: true }) as string[]
		},
		{
			id: 'payments',
			icon: <CreditCard className="h-6 w-6 text-indigo-500" />,
			title: t('terms.sections.payments.title'),
			content: t('terms.sections.payments.content')
		},
		{
			id: 'liability',
			icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
			title: t('terms.sections.liability.title'),
			content: t('terms.sections.liability.content')
		},
		{
			id: 'termination',
			icon: <UserX className="h-6 w-6 text-rose-500" />,
			title: t('terms.sections.termination.title'),
			content: t('terms.sections.termination.content')
		},
		{
			id: 'contact',
			icon: <Mail className="h-6 w-6 text-slate-500" />,
			title: t('terms.sections.contact.title'),
			content: t('terms.sections.contact.content'),
			isContact: true
		}
	];

	return (
		<div className="max-w-4xl mx-auto space-y-8 pb-12">
			<header className="text-center space-y-4">
				<div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
					<ShieldCheck className="h-10 w-10 text-primary" />
				</div>
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
					{t('terms.title')}
				</h1>
				<p className="text-muted-foreground text-lg">
					{t('terms.effectiveDate')}
				</p>
				<Separator className="max-w-xs mx-auto" />
			</header>

			<div className="grid gap-6">
				{sections.map((section) => (
					<Card key={section.id} className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
						<CardHeader className="flex flex-row items-center gap-4 pb-2">
							<div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
								{section.icon}
							</div>
							<CardTitle className="text-xl font-bold">{section.title}</CardTitle>
						</CardHeader>
						<CardContent className="pt-4 px-6 md:px-10">
							{section.items ? (
								<ul className="grid gap-3 list-none p-0">
									{section.items.map((item, idx) => (
										<li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-400 leading-relaxed">
											<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
											{item}
										</li>
									))}
								</ul>
							) : (
								<p className="text-slate-600 dark:text-slate-400 leading-relaxed">
									{section.isContact ? (
										<>
											{section.content.split(': ')[0]}:{" "}
											<a href="mailto:info@kaarplus.ee" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
												info@kaarplus.ee
											</a>
										</>
									) : (
										section.content
									)}
								</p>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			<footer className="text-center pt-8">
				<p className="text-sm text-muted-foreground italic">
					{t('common:footer.description')}
				</p>
			</footer>
		</div>
	);
}
