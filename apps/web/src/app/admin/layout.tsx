import { ReactNode } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    Settings,
    ShieldCheck,
    LogOut,
    Car
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const navItems = [
        { name: "Ülevaade", href: "/admin", icon: LayoutDashboard },
        { name: "Kinnitamise järjekord", href: "/admin/listings", icon: ClipboardList },
        { name: "Kasutajad", href: "/admin/users", icon: Users },
        { name: "Seaded", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-border sticky top-0 h-screen hidden md:flex flex-col">
                <div className="p-6 border-b border-border flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Kaarplus</h1>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
                            )}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <LogOut size={18} />
                        Tagasi portaali
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4 md:hidden">
                        <Car className="text-primary" />
                        <span className="font-bold">Kaarplus Admin</span>
                    </div>

                    <div className="hidden md:block text-sm text-muted-foreground">
                        Tere tulemast tagasi, <span className="font-semibold text-foreground italic">Admin</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold border border-border">
                            A
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
