"use client";

import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Fingerprint,
	Database,
	BarChart3,
	UserCheck,
	History,
	Cookie,
	Mail,
	ChevronRight
} from "lucide-react";

export default function PrivacyPage() {
	const { t } = useTranslation('legal');

	const sections = [
		{
			id: 'general',
			icon: <Fingerprint className="h-6 w-6 text-primary" />,
			title: t('privacy.sections.general.title'),
			content: t('privacy.sections.general.content')
		},
		{
			id: 'dataCollection',
			icon: <Database className="h-6 w-6 text-blue-500" />,
			title: t('privacy.sections.dataCollection.title'),
			description: t('privacy.sections.dataCollection.description'),
			items: t('privacy.sections.dataCollection.items', { returnObjects: true }) as string[]
		},
		{
			id: 'dataUsage',
			icon: <BarChart3 className="h-6 w-6 text-emerald-500" />,
			title: t('privacy.sections.dataUsage.title'),
			description: t('privacy.sections.dataUsage.description'),
			items: t('privacy.sections.dataUsage.items', { returnObjects: true }) as string[]
		},
		{
			id: 'rights',
			icon: <UserCheck className="h-6 w-6 text-indigo-500" />,
			title: t('privacy.sections.rights.title'),
			description: t('privacy.sections.rights.description'),
			items: t('privacy.sections.rights.items', { returnObjects: true }) as string[],
			footer: t('privacy.sections.rights.footer')
		},
		{
			id: 'retention',
			icon: <History className="h-6 w-6 text-amber-500" />,
			title: t('privacy.sections.retention.title'),
			content: t('privacy.sections.retention.content')
		},
		{
			id: 'cookies',
			icon: <Cookie className="h-6 w-6 text-rose-500" />,
			title: t('privacy.sections.cookies.title'),
			content: t('privacy.sections.cookies.content'),
			link: {
				href: "/cookies",
				label: t('cookies.settingsTitle')
			}
		},
		{
			id: 'contact',
			icon: <Mail className="h-6 w-6 text-slate-500" />,
			title: t('privacy.sections.contact.title'),
			content: t('privacy.sections.contact.content')
		}
	];

	return (
		<div className="max-w-4xl mx-auto space-y-8 pb-12">
			<header className="text-center space-y-4">
				<div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
					<Fingerprint className="h-10 w-10 text-primary" />
				</div>
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
					{t('privacy.title')}
				</h1>
				<p className="text-muted-foreground text-lg">
					{t('privacy.effectiveDate')}
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
							<div className="space-y-4">
								{section.description && (
									<p className="font-medium text-slate-900 dark:text-white">
										{section.description}
									</p>
								)}

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
										{section.id === 'contact' ? (
											<>
												{section.content.split(': ')[0]}:{" "}
												<a href="mailto:privacy@kaarplus.ee" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
													privacy@kaarplus.ee
												</a>
											</>
										) : (
											section.content
										)}
									</p>
								)}

								{section.footer && (
									<p className="text-sm border-t pt-4 mt-4 border-slate-100 dark:border-slate-800 text-slate-500 italic">
										{section.footer}
									</p>
								)}

								{section.link && (
									<div className="pt-2">
										<a
											href={section.link.href}
											className="inline-flex items-center gap-2 text-primary font-semibold hover:underline decoration-2 underline-offset-4"
										>
											{section.link.label}
											<ChevronRight className="h-4 w-4" />
										</a>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<footer className="text-center pt-8">
				<p className="text-sm text-muted-foreground italic">
					{t('common.footer.description')}
				</p>
			</footer>
		</div>
	);
}
