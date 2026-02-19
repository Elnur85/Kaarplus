"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Car, AlertCircle } from "lucide-react";

export default function DealershipsPage() {
	const { t } = useTranslation("dealership");
	const [dealerships, setDealerships] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchDealerships = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/v1/dealerships`);
			if (!res.ok) throw new Error("Failed to fetch");
			const json = await res.json();
			setDealerships(json.data || []);
		} catch {
			setError(t("list.error"));
			setDealerships([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDealerships();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="container py-12">
			<div className="mb-10 text-center">
				<h1 className="text-3xl font-bold tracking-tight mb-4">{t("list.title")}</h1>
				<p className="text-muted-foreground max-w-2xl mx-auto">
					{t("list.description")}
				</p>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="overflow-hidden">
							<Skeleton className="h-48 w-full" />
							<CardHeader className="pt-10 pb-2">
								<Skeleton className="h-6 w-3/4 mb-2" />
								<Skeleton className="h-4 w-1/2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-2/3" />
							</CardContent>
							<CardFooter>
								<Skeleton className="h-10 w-full" />
							</CardFooter>
						</Card>
					))}
				</div>
			) : error ? (
				<div className="rounded-xl border border-destructive/20 bg-destructive/10 p-12 text-center">
					<div className="flex flex-col items-center gap-3">
						<div className="flex items-center gap-2 text-destructive">
							<AlertCircle className="h-5 w-5" />
							<span className="font-medium">{error}</span>
						</div>
						<Button variant="outline" onClick={fetchDealerships}>
							{t("list.retry")}
						</Button>
					</div>
				</div>
			) : dealerships.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{dealerships.map((dealer: any) => (
						<Card key={dealer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
							<div className="h-48 relative bg-muted">
								{dealer.coverImage ? (
									<Image
										src={dealer.coverImage}
										alt={dealer.name}
										fill
										className="object-cover"
										unoptimized
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
										<Car className="h-16 w-16 text-slate-300" />
									</div>
								)}
								<div className="absolute -bottom-8 left-6">
									<div className="h-16 w-16 rounded-full border-4 border-background bg-background overflow-hidden shadow-sm relative">
										{dealer.image ? (
											<Image
												src={dealer.image}
												alt={dealer.name}
												fill
												className="object-cover"
												unoptimized
											/>
										) : (
											<div className="w-full h-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
												{dealer.name?.charAt(0) || "D"}
											</div>
										)}
									</div>
								</div>
							</div>
							<CardHeader className="pt-10 pb-2">
								<h2 className="text-xl font-bold">{dealer.name}</h2>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<MapPin size={14} />
									<span>{dealer.address || t("list.locationNotSpecified")}</span>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground line-clamp-2">
									{dealer.bio || t("list.noBio")}
								</p>
							</CardContent>
							<CardFooter className="border-t bg-muted/20 p-4">
								<div className="flex items-center justify-between w-full">
									<span className="text-sm font-medium">
										{t("list.activeListings", { count: dealer._count?.listings || 0 })}
									</span>
									<Button size="sm" variant="secondary" asChild>
										<Link href={`/dealers/${dealer.id}`}>
											{t("list.viewDealer")}
										</Link>
									</Button>
								</div>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
					<p className="text-muted-foreground">{t("list.noDealers")}</p>
				</div>
			)}
		</div>
	);
}
