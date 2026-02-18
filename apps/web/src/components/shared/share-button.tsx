"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Share2, Link2, Facebook, Twitter, Linkedin, Mail, Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
	title: string;
	url: string;
	description?: string;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
	showLabel?: boolean;
}

export function ShareButton({
	title,
	url,
	description,
	variant = "outline",
	size = "default",
	className,
	showLabel = true,
}: ShareButtonProps) {
	const { t } = useTranslation("common");
	const { toast } = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const origin = typeof window !== 'undefined' ? window.location.origin : '';
	const fullUrl = url.startsWith("http") ? url : `${origin}${url}`;
	const encodedUrl = encodeURIComponent(fullUrl);
	const encodedTitle = encodeURIComponent(title);
	const encodedDescription = encodeURIComponent(description || "");

	const handleNativeShare = useCallback(async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title,
					text: description,
					url: fullUrl,
				});
				toast({
					title: t("share.success"),
					description: t("share.shared"),
				});
			} catch (error) {
				// User cancelled or share failed
				if ((error as Error).name !== "AbortError") {
					console.error("Share failed:", error);
				}
			}
		} else {
			setIsOpen(true);
		}
	}, [title, description, fullUrl, toast, t]);

	const handleCopyLink = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(fullUrl);
			setCopied(true);
			toast({
				title: t("share.copied"),
				description: t("share.linkCopied"),
			});
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			toast({
				title: t("share.copyFailed"),
				description: t("share.copyFailedDesc"),
				variant: "destructive",
			});
		}
	}, [fullUrl, toast, t]);

	const shareLinks = [
		{
			name: "Facebook",
			icon: Facebook,
			url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			color: "bg-[#1877F2] hover:bg-[#1877F2]/90",
		},
		{
			name: "Twitter",
			icon: Twitter,
			url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
			color: "bg-[#1DA1F2] hover:bg-[#1DA1F2]/90",
		},
		{
			name: "LinkedIn",
			icon: Linkedin,
			url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
			color: "bg-[#0A66C2] hover:bg-[#0A66C2]/90",
		},
		{
			name: "WhatsApp",
			icon: MessageCircle,
			url: `https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${encodedUrl}`,
			color: "bg-[#25D366] hover:bg-[#25D366]/90",
		},
		{
			name: "Email",
			icon: Mail,
			url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
			color: "bg-slate-600 hover:bg-slate-600/90",
		},
	];

	const handleShareClick = (shareUrl: string) => {
		window.open(shareUrl, "_blank", "width=600,height=400,scrollbars=yes");
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant={variant}
					size={size}
					className={cn("gap-2", className)}
					onClick={() => !navigator.share && setIsOpen(true)}
				>
					<Share2 size={size === "icon" ? 18 : 16} />
					{showLabel && t("share.button")}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t("share.title")}</DialogTitle>
					<DialogDescription>{t("share.description")}</DialogDescription>
				</DialogHeader>
				<div className="py-4 space-y-4">
					{/* Copy Link Section */}
					<div className="flex gap-2">
						<Input
							value={fullUrl}
							readOnly
							className="flex-1"
							onClick={(e) => e.currentTarget.select()}
						/>
						<Button
							variant="outline"
							size="icon"
							onClick={handleCopyLink}
							className={cn("shrink-0 transition-colors", copied && "bg-green-100 text-green-600")}
						>
							{copied ? <Check size={18} /> : <Copy size={18} />}
						</Button>
					</div>

					{/* Social Share Buttons */}
					<div className="grid grid-cols-4 gap-3">
						{shareLinks.map((link) => (
							<button
								key={link.name}
								onClick={() => handleShareClick(link.url)}
								className={cn(
									"flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
									"hover:scale-105 active:scale-95"
								)}
							>
								<div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white", link.color)}>
									<link.icon size={24} />
								</div>
								<span className="text-xs font-medium text-slate-600">{link.name}</span>
							</button>
						))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
