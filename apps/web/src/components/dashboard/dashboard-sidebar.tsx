"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Heart,
  Settings,
  User,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";

export function DashboardSidebar() {
  const { t } = useTranslation('dashboard');
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { label: t('sidebar.nav.overview'), href: "/dashboard", icon: LayoutDashboard },
    { label: t('sidebar.nav.myListings'), href: "/dashboard/listings", icon: List },
    { label: t('sidebar.nav.favorites'), href: "/favorites", icon: Heart },
    { label: t('sidebar.nav.savedSearches'), href: "/dashboard/saved-searches", icon: Bookmark },
    { label: t('sidebar.nav.settings'), href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="space-y-6">
      {/* Profile section */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {session?.user?.name || t('sidebar.user')}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {t('sidebar.clientType')}
          </p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              )}
            >
              <item.icon className="size-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

