"use client";

import { Trans, useTranslation } from "react-i18next";
import { Search, Mail, Calendar, Loader2, Shield, UserX, ChevronDown } from "lucide-react";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface User {
	id: string;
	name: string | null;
	email: string;
	role: string;
	createdAt: string;
}

export default function AdminUsersPage() {
	const { t, i18n } = useTranslation("admin");
	const { toast } = useToast();
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const localeCode =
		i18n.language === "et" ? "et-EE" : i18n.language === "ru" ? "ru-RU" : "en-GB";

	const fetchUsers = () => {
		setIsLoading(true);
		fetch(`${API_URL}/admin/users`, { credentials: "include" })
			.then((res) => res.json())
			.then((json) => setUsers(json.data || []))
			.catch(console.error)
			.finally(() => setIsLoading(false));
	};

	useEffect(() => { fetchUsers(); }, []);

	const filteredUsers = users.filter(user =>
		user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		user.email.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString(localeCode, { day: "2-digit", month: "2-digit", year: "numeric" });

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case 'ADMIN': return 'default';
			case 'DEALERSHIP': return 'secondary';
			default: return 'outline';
		}
	};

	const getRoleLabel = (role: string) =>
		t(`users.roles.${role}`, { defaultValue: role });

	const handleChangeRole = async (userId: string, newRole: string) => {
		try {
			const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ role: newRole }),
			});
			if (!res.ok) throw new Error("Failed to update role");
			toast({
				title: t("users.toasts.roleUpdated.title"),
				description: t("users.toasts.roleUpdated.description", {
					role: getRoleLabel(newRole),
				}),
			});
			fetchUsers();
		} catch {
			toast({
				title: t("users.toasts.roleUpdateFailed.title"),
				description: t("users.toasts.roleUpdateFailed.description"),
				variant: "destructive",
			});
		}
	};

	const handleDeleteUser = async () => {
		if (!deleteTarget) return;
		setIsDeleting(true);
		try {
			const res = await fetch(`${API_URL}/admin/users/${deleteTarget.id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!res.ok && res.status !== 204) throw new Error("Failed to delete user");
			toast({
				title: t("users.toasts.userDeleted.title"),
				description: t("users.toasts.userDeleted.description", {
					email: deleteTarget.email,
				}),
			});
			setDeleteTarget(null);
			fetchUsers();
		} catch {
			toast({
				title: t("users.toasts.userDeleteFailed.title"),
				description: t("users.toasts.userDeleteFailed.description"),
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
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
										? t("users.noResults")
										: t("users.empty")
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
												<p className="font-semibold text-sm">{user.name || t("users.noName")}</p>
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
											{getRoleLabel(user.role)}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1 text-sm text-muted-foreground">
											<Calendar size={14} />
											{formatDate(user.createdAt)}
										</div>
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm" className="gap-1 h-8 text-xs font-semibold">
													{t("users.actions.button")} <ChevronDown size={14} />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-48">
												<DropdownMenuLabel className="text-xs">
													{t("users.actions.menuLabel", { value: user.name || user.email })}
												</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuSub>
													<DropdownMenuSubTrigger className="gap-2 text-sm">
														<Shield size={14} /> {t("users.actions.changeRole")}
													</DropdownMenuSubTrigger>
													<DropdownMenuSubContent>
														{(["USER", "DEALERSHIP", "ADMIN"] as const).map((role) => (
															<DropdownMenuItem
																key={role}
																disabled={user.role === role}
																onClick={() => handleChangeRole(user.id, role)}
																className="text-sm"
															>
																{role === user.role ? `✓ ${getRoleLabel(role)}` : getRoleLabel(role)}
															</DropdownMenuItem>
														))}
													</DropdownMenuSubContent>
												</DropdownMenuSub>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => setDeleteTarget(user)}
													className="text-destructive focus:text-destructive gap-2 text-sm"
												>
													<UserX size={14} /> {t("users.actions.delete")}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("users.deleteDialog.title")}</AlertDialogTitle>
						<AlertDialogDescription>
							<Trans
								ns="admin"
								i18nKey="users.deleteDialog.description"
								values={{ email: deleteTarget?.email || "" }}
								components={{ strong: <strong /> }}
							/>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							{t("users.deleteDialog.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteUser}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? (
								<>
									<Loader2 size={14} className="animate-spin mr-2" />
									{t("users.deleteDialog.deleting")}
								</>
							) : (
								t("users.deleteDialog.confirm")
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
