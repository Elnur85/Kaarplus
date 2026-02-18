"use client";

import { useTranslation } from "react-i18next";
import { Search, MoreHorizontal, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
    const { t } = useTranslation("admin");

    // Mock data for initial UI implementation
    const users = [
        { id: "1", name: "Elnur Aghabayli", email: "elnur@example.com", role: "ADMIN", createdAt: "2024-01-15" },
        { id: "2", name: "Juhan Juurikas", email: "juhan@juhan.ee", role: "INDIVIDUAL_SELLER", createdAt: "2024-02-10" },
        { id: "3", name: "Mari Maasikas", email: "mari@maasikas.ee", role: "BUYER", createdAt: "2024-02-12" },
        { id: "4", name: "Automaailm AS", email: "info@automaailm.ee", role: "DEALERSHIP", createdAt: "2024-02-01" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t("users.title")}</h2>
                    <p className="text-muted-foreground mt-1">
                        {t("users.description", { count: users.length })}
                    </p>
                </div>
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input placeholder={t("users.searchPlaceholder")} className="pl-10 h-10 border-border/50" />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-slate-50/50">
                            <TableHead className="w-[250px] py-4">{t("users.table.user")}</TableHead>
                            <TableHead>{t("users.table.role")}</TableHead>
                            <TableHead>{t("users.table.joined")}</TableHead>
                            <TableHead className="text-right">{t("users.table.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="group transition-colors">
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold border border-border">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{user.name}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Mail size={12} />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                                        className={user.role === "ADMIN" ? "bg-primary text-white" : "font-medium"}
                                    >
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar size={14} />
                                        {user.createdAt}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors">
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
