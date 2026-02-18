"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    const { t } = useTranslation('listings');
    return (
        <nav className={cn("flex items-center gap-2 text-xs font-medium text-muted-foreground mb-6", className)}>
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Home size={14} />
                <span>{t('carsPage.breadcrumb.home', { defaultValue: 'Avaleht' })}</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <ChevronRight size={12} className="text-slate-400" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-primary truncate max-w-[200px]">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}
