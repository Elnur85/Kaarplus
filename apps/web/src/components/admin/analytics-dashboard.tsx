"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { StatsCard } from "./stats-card";
import { AnalyticsChart } from "./analytics-charts";
import { Loader2, Users, Car, CheckCircle, Clock, ShoppingCart, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { useTranslation } from "react-i18next";

export function AnalyticsDashboard() {
    const { t, i18n } = useTranslation('admin');
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const localeCode = i18n.language === 'et' ? 'et-EE' : i18n.language === 'ru' ? 'ru-RU' : 'en-GB';

    const fetchAnalytics = useCallback(async () => {
        if (!session?.user) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/v1/admin/analytics`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error(t('queue.error.message'));
            const result = await res.json();
            setData(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [session, setIsLoading, setData, setError, t]);

    useEffect(() => {
        if (session) {
            fetchAnalytics();
        }
    }, [fetchAnalytics, session]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground animate-pulse">{t('dashboard.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-lg mx-auto">
                <AlertCircle className="text-destructive mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-destructive">{t('queue.error.title')}</h3>
                <p className="text-muted-foreground mt-2 mb-6">{error}</p>
                <Button onClick={fetchAnalytics} variant="outline">{t('queue.error.retry')}</Button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
                    <p className="text-muted-foreground mt-1">
                        {t('dashboard.description')}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAnalytics}>{t('dashboard.refresh')}</Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title={t('dashboard.stats.revenue.title')}
                    value={`${data.summary.totalRevenue.toLocaleString(localeCode)} €`}
                    icon={DollarSign}
                    description={t('dashboard.stats.revenue.description')}
                    trend={t('dashboard.stats.revenue.trend', { trend: "+12%" })}
                    trendUp={true}
                />
                <StatsCard
                    title={t('dashboard.stats.activeListings.title')}
                    value={data.summary.activeListings}
                    icon={Car}
                    description={t('dashboard.stats.activeListings.description', { count: data.summary.totalListings })}
                />
                <StatsCard
                    title={t('dashboard.stats.users.title')}
                    value={data.summary.totalUsers}
                    icon={Users}
                    description={t('dashboard.stats.users.description', { count: 5 })}
                    trend={t('dashboard.stats.users.trend', { trend: "+4%" })}
                    trendUp={true}
                />
                <StatsCard
                    title={t('dashboard.stats.soldVehicles.title')}
                    value={data.summary.soldListings}
                    icon={ShoppingCart}
                    description={t('dashboard.stats.soldVehicles.description')}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <AnalyticsChart
                        title={t('dashboard.charts.newListings')}
                        data={data.charts.listings}
                        dataKey="count"
                        color="#0ea5e9"
                    />
                </div>
                <div className="col-span-3">
                    <AnalyticsChart
                        title={t('dashboard.charts.newUsers')}
                        data={data.charts.registrations}
                        dataKey="count"
                        color="#10b981"
                    />
                </div>
            </div>

            {/* Recent Activity Tabs */}
            <Tabs defaultValue="payments" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="payments">{t('dashboard.tabs.payments')}</TabsTrigger>
                    <TabsTrigger value="users">{t('dashboard.tabs.users')}</TabsTrigger>
                </TabsList>
                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('dashboard.tables.transactions.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('dashboard.tables.transactions.date')}</TableHead>
                                        <TableHead>{t('dashboard.tables.transactions.amount')}</TableHead>
                                        <TableHead>{t('dashboard.tables.transactions.status')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.recent.payments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                {t('dashboard.tables.transactions.empty')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.recent.payments.map((payment: any) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{new Date(payment.createdAt).toLocaleDateString(localeCode)}</TableCell>
                                                <TableCell className="font-medium">{Number(payment.amount).toLocaleString(localeCode)} {payment.currency}</TableCell>
                                                <TableCell>
                                                    <Badge variant={payment.status === "COMPLETED" ? "default" : "secondary"}>
                                                        {payment.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('dashboard.tables.recentUsers.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('dashboard.tables.recentUsers.name')}</TableHead>
                                        <TableHead>{t('dashboard.tables.recentUsers.email')}</TableHead>
                                        <TableHead>{t('dashboard.tables.recentUsers.role')}</TableHead>
                                        <TableHead>{t('dashboard.tables.recentUsers.joined')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.recent.users.map((user: any) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{user.role}</Badge>
                                            </TableCell>
                                            <TableCell>{new Date(user.createdAt).toLocaleDateString(localeCode)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

