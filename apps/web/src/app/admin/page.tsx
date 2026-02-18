"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ClipboardList, Users, TrendingUp, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsData {
    pendingListings: number;
    activeUsers: number;
    totalListings: number;
    verifiedToday: number;
}

function StatsCard({
    name,
    value,
    icon: Icon,
    color,
    bg,
    subtext
}: {
    name: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bg: string;
    subtext?: string;
}) {
    return (
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {name}
                </CardTitle>
                <div className={`${bg} ${color} p-2 rounded-lg`}>
                    <Icon size={16} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtext && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {subtext}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function StatsSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-border/50 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function AdminStats() {
    const { t } = useTranslation("admin");
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to fetch stats");
            const data = await res.json();
            setStats(data.data);
        } catch (e) {
            setError(t("overview.stats.failed"));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (isLoading) return <StatsSkeleton />;

    if (error) {
        return (
            <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                {error}
            </div>
        );
    }

    const statItems = [
        {
            name: t("overview.stats.pendingListings"),
            value: stats?.pendingListings ?? "-",
            icon: ClipboardList,
            color: "text-amber-500",
            bg: "bg-amber-50",
            subtext: t("overview.stats.pendingSubtext")
        },
        {
            name: t("overview.stats.activeUsers"),
            value: stats?.activeUsers ?? "-",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50",
            subtext: t("overview.stats.activeUsersSubtext")
        },
        {
            name: t("overview.stats.totalListings"),
            value: stats?.totalListings ?? "-",
            icon: TrendingUp,
            color: "text-primary",
            bg: "bg-green-50",
            subtext: t("overview.stats.totalListingsSubtext")
        },
        {
            name: t("overview.stats.verifiedToday"),
            value: stats?.verifiedToday ?? "-",
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            subtext: t("overview.stats.verifiedTodaySubtext")
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statItems.map((stat) => (
                <StatsCard key={stat.name} {...stat} />
            ))}
        </div>
    );
}

export default function AdminPage() {
    const { t } = useTranslation("admin");
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user || session.user.role !== "ADMIN") {
            router.push("/login");
        }
    }, [session, status, router]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (!session?.user || session.user.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t("overview.title")}</h2>
                <p className="text-muted-foreground mt-1">
                    {t("overview.description")}
                </p>
            </div>

            <Suspense fallback={<StatsSkeleton />}>
                <AdminStats />
            </Suspense>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t("overview.quickActions")}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Link
                            href="/admin/listings"
                            className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                                    <ClipboardList size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold">{t("overview.viewQueue")}</p>
                                    <p className="text-sm text-muted-foreground">{t("overview.viewQueueDesc")}</p>
                                </div>
                            </div>
                            <div className="text-muted-foreground group-hover:text-primary transform transition-transform group-hover:translate-x-1">
                                →
                            </div>
                        </Link>

                        <Link
                            href="/admin/users"
                            className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold">{t("overview.manageUsers")}</p>
                                    <p className="text-sm text-muted-foreground">{t("overview.manageUsersDesc")}</p>
                                </div>
                            </div>
                            <div className="text-muted-foreground group-hover:text-primary transform transition-transform group-hover:translate-x-1">
                                →
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
