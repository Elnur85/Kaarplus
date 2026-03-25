"use client";

import Link from "next/link";
import { Car } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
	const { t } = useTranslation('common');

	return (
		<footer className="bg-slate-950 text-slate-400 py-16">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-2 md:grid-cols-3 gap-12 mb-16">
					{/* Brand Column */}
					<div className="col-span-2 md:col-span-1 space-y-8">
						<Link href="/" className="flex items-center gap-2">
							<div className="bg-primary p-1 rounded">
								<Car className="text-white h-5 w-5" />
							</div>
							<span className="text-xl font-extrabold tracking-tight text-white">
								Kaar<span className="text-primary">plus</span>
							</span>
						</Link>
						<p className="text-sm leading-relaxed mb-6">
							{t('footer.description')}
						</p>
					</div>

					{/* QUICK LINKS */}
					<div>
						<h4 className="text-white font-bold mb-8 uppercase text-xs tracking-[0.2em]">
							{t('footer.services.title')}
						</h4>
						<ul className="space-y-4 text-sm font-medium">
							<li><Link href="/listings" className="hover:text-primary transition-colors">{t('footer.services.allListings')}</Link></li>
							<li><Link href="/sell" className="hover:text-primary transition-colors">{t('footer.services.sellYourCar')}</Link></li>
							<li><Link href="/listings?fuelType=Electric" className="hover:text-primary transition-colors">{t('footer.services.electricVehicles')}</Link></li>
							<li><Link href="/listings?sort=createdAt_desc" className="hover:text-primary transition-colors">{t('footer.services.newListings')}</Link></li>
						</ul>
					</div>

					{/* ABOUT US */}
					<div>
						<h4 className="text-white font-bold mb-8 uppercase text-xs tracking-[0.2em]">
							{t('footer.company.title')}
						</h4>
						<ul className="space-y-4 text-sm font-medium">
							<li><Link href="/faq" className="hover:text-primary transition-colors">{t('footer.company.faq')}</Link></li>
							<li><Link href="/terms" className="hover:text-primary transition-colors">{t('footer.company.terms')}</Link></li>
							<li><Link href="/privacy" className="hover:text-primary transition-colors">{t('footer.company.privacy')}</Link></li>
							<li><Link href="/cookies" className="hover:text-primary transition-colors">{t('footer.company.cookies')}</Link></li>
						</ul>
					</div>
				</div>

				{/* BOTTOM BAR */}
				<div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest">
					<p>© {new Date().getFullYear()} Kaarplus. {t('footer.allRightsReserved')}.</p>
					<div className="flex gap-8">
						<Link href="/privacy" className="hover:text-white transition-colors">{t('footer.company.privacy')}</Link>
						<Link href="/cookies" className="hover:text-white transition-colors">{t('footer.company.cookies')}</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
