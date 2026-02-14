import {
    ClipboardList,
    Users,
    TrendingUp,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
    const stats = [
        { name: "Kinnitamist ootavad", value: "12", icon: ClipboardList, color: "text-amber-500", bg: "bg-amber-50" },
        { name: "Aktiivsed kasutajad", value: "1,280", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
        { name: "Kuulutusi kokku", value: "3,452", icon: TrendingUp, color: "text-primary", bg: "bg-green-50" },
        { name: "Kinnitatud täna", value: "24", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Ülevaade</h2>
                <p className="text-muted-foreground mt-1">
                    Kaarplus portaali haldus ja statistika.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.name}
                            </CardTitle>
                            <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                                <stat.icon size={16} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-emerald-500 font-medium">+12%</span> eelmisest kuust
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Kiired tegevused</CardTitle>
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
                                    <p className="font-semibold">Vaata kinnitusjärjekorda</p>
                                    <p className="text-sm text-muted-foreground">12 kuulutust ootab ülevaatamist</p>
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
                                    <p className="font-semibold">Halda kasutajaid</p>
                                    <p className="text-sm text-muted-foreground">Otsi ja muuda kasutajate andmeid</p>
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
