"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { MessageSquare, Loader2, CheckCircle2, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";
import Link from "next/link";

interface ContactSellerDialogProps {
	listingId: string;
	listingTitle: string;
	triggerButton?: React.ReactNode;
}

interface FormData {
	name: string;
	email: string;
	phone: string;
	message: string;
}

export function ContactSellerDialog({ listingId, listingTitle, triggerButton }: ContactSellerDialogProps) {
	const { t } = useTranslation("carDetail");
	const { toast } = useToast();
	const { data: session } = useSession();
	const isAuthenticated = !!session;

	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		name: session?.user?.name || "",
		email: session?.user?.email || "",
		phone: "",
		message: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.message.trim()) {
			toast({
				title: t("contact.validationError"),
				description: t("contact.messageRequired"),
				variant: "destructive",
			});
			return;
		}

		// For unauthenticated users, require name and valid email
		if (!isAuthenticated) {
			if (!formData.name.trim() || !formData.email.trim()) {
				toast({
					title: t("contact.validationError"),
					description: t("contact.nameEmailRequired"),
					variant: "destructive",
				});
				return;
			}
			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email.trim())) {
				toast({
					title: t("contact.validationError"),
					description: t("contact.invalidEmail"),
					variant: "destructive",
				});
				return;
			}
		}

		setIsLoading(true);
		try {
			const response = await apiFetch(`/listings/${listingId}/contact`, {
				method: "POST",
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || t("contact.sendError"));
			}

			setIsSuccess(true);
			toast({
				title: t("contact.successTitle"),
				description: t("contact.successDesc"),
			});
		} catch (error) {
			toast({
				title: t("contact.errorTitle"),
				description: error instanceof Error ? error.message : t("contact.sendError"),
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleClose = () => {
		setIsOpen(false);
		// Reset form after a delay
		setTimeout(() => {
			setIsSuccess(false);
			setFormData({
				name: session?.user?.name || "",
				email: session?.user?.email || "",
				phone: "",
				message: "",
			});
		}, 300);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{triggerButton || (
					<Button
						variant="outline"
						className="w-full h-12 border-2 text-primary border-primary hover:bg-primary/5 font-bold gap-2 rounded-xl"
					>
						<MessageSquare size={18} /> {t("priceCard.contactSeller")}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
				{isSuccess ? (
					<div className="py-8 flex flex-col items-center justify-center text-center gap-4">
						<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
							<CheckCircle2 size={32} />
						</div>
						<div>
							<h3 className="text-xl font-bold">{t("contact.successTitle")}</h3>
							<p className="text-muted-foreground mt-2">
								{t("contact.successDesc", { title: listingTitle })}
							</p>
						</div>
						<div className="flex gap-3 mt-4">
							<Button variant="outline" onClick={handleClose}>
								{t("contact.close")}
							</Button>
							{isAuthenticated && (
								<Button asChild>
									<Link href="/dashboard/messages">{t("contact.viewMessages")}</Link>
								</Button>
							)}
						</div>
					</div>
				) : (
					<form onSubmit={handleSubmit}>
						<DialogHeader>
							<DialogTitle>{t("contact.dialogTitle")}</DialogTitle>
							<DialogDescription>
								{t("contact.dialogDescription", { title: listingTitle })}
							</DialogDescription>
						</DialogHeader>

						{/* Show login prompt for unauthenticated users */}
						{!isAuthenticated && (
							<div className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
								<p className="text-sm text-amber-800">
									{t("contact.loginPrompt")}{" "}
									<Link href="/login" className="font-semibold underline">
										{t("contact.loginLink")}
									</Link>
								</p>
							</div>
						)}

						<div className="py-4 space-y-4">
							{/* Only show name/email fields for unauthenticated users */}
							{!isAuthenticated && (
								<>
									<div className="space-y-2">
										<Label htmlFor="name" className="flex items-center gap-2">
											<User size={16} /> {t("contact.nameLabel")} *
										</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) => handleInputChange("name", e.target.value)}
											placeholder={t("contact.namePlaceholder")}
											required={!isAuthenticated}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email" className="flex items-center gap-2">
											<Mail size={16} /> {t("contact.emailLabel")} *
										</Label>
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={(e) => handleInputChange("email", e.target.value)}
											placeholder={t("contact.emailPlaceholder")}
											required={!isAuthenticated}
										/>
									</div>
								</>
							)}

							<div className="space-y-2">
								<Label htmlFor="phone" className="flex items-center gap-2">
									<Phone size={16} /> {t("contact.phoneLabel")}
								</Label>
								<Input
									id="phone"
									type="tel"
									value={formData.phone}
									onChange={(e) => handleInputChange("phone", e.target.value)}
									placeholder={t("contact.phonePlaceholder")}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="message">
									{t("contact.messageLabel")} *
								</Label>
								<Textarea
									id="message"
									value={formData.message}
									onChange={(e) => handleInputChange("message", e.target.value)}
									placeholder={t("contact.messagePlaceholder")}
									rows={4}
									required
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 size={16} className="mr-2 animate-spin" />
										{t("contact.sending")}
									</>
								) : (
									t("contact.sendButton")
								)}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
