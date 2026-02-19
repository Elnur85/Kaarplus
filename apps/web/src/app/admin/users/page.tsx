"use client";

import { useTranslation } from "react-i18next";
import { Search, MoreHorizontal, Mail, Calendar, Loader2 } from "lucide-react";
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
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
	id: string;
	name: string | null;
	email: string;
	role: string;
	createdAt: string;
}

export default function AdminUsersPage() {
	const { t } = useTranslation("admin");
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		// Fetch users from admin API
		fetch(`${API_URL}/admin/users`, {
			credentials: "include",
		})
			.then((res) => res.json())
			.then((json) => {
				setUsers(json.data || []);
			})
			.catch(console.error)
			.finally(() => setIsLoading(false));
	}, []);

	const filteredUsers = users.filter(user =>
		user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		user.email.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString('et-EE', {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case 'ADMIN':
				return 'default';
			case 'DEALERSHIP':
				return 'secondary';
			case 'USER':
				return 'outline';
			default:
				return 'secondary';
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<Skeleton className="h-8 w-48 mb-2" />
						<Skeleton className="h-4 w-32" />
					</div>
					<Skeleton className="h-10 w-64" />
				</div>
				<div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl overflow-hidden shadow-sm p-6">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full mb-4" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">{t("users.title")}</h2>
					<p className="text-muted-foreground mt-1">
						{t("users.description", { count: filteredUsers.length })}
					</p>
				</div>
				<div className="relative max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
					<Input
						placeholder={t("users.searchPlaceholder")}
						className="pl-10 h-10 border-border/50"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
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
						{filteredUsers.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
									{searchQuery
										? t("users.noResults", { defaultValue: "Kasutajaid ei leitud" })
										: t("users.empty", { defaultValue: "Kasutajaid pole" })
									}
								</TableCell>
							</TableRow>
						) : (
							filteredUsers.map((user) => (
								<TableRow key={user.id} className="group transition-colors">
									<TableCell className="py-4">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold border border-border">
												{user.name?.charAt(0) || user.email.charAt(0)}
											</div>
											<div>
												<p className="font-semibold text-sm">{user.name || t("users.noName", { defaultValue: "Nimi puudub" })}</p>
												<div className="flex items-center gap-1 text-xs text-muted-foreground">
													<Mail size={12} />
													{user.email}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant={getRoleBadgeVariant(user.role)}
											className={user.role === "ADMIN" ? "bg-primary text-white" : "font-medium"}
										>
											{user.role}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1 text-sm text-muted-foreground">
											<Calendar size={14} />
											{formatDate(user.createdAt)}
										</div>
									</TableCell>
									<TableCell className="text-right">
										<Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors">
											<MoreHorizontal size={18} />
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
