"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/constants";
import { t } from "i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Car, Calendar, Info } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface Inspection {
    id: string;
    listingId: string;
    status: "PENDING" | "COMPLETED" | "CANCELLED" | "IN_PROGRESS";
    createdAt: string;
    listing: {
        make: string;
        model: string;
        year: number;
    };
}

export function MyInspectionsList() {
    const { t } = useTranslation(['inspection', 'dashboard']);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInspections = async () => {
            try {
                const res = await fetch(`${API_URL}/user/inspections`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setInspections(json.data || []);
            } catch (error) {
                console.error("Failed to fetch inspections:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInspections();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (inspections.length === 0) {
        return null; // Don't show anything if no inspections
    }

    const getStatusBadge = (status: string) => {
        const statusLabel = t(`inspection:status.labels.${status}`, { defaultValue: status });
        switch (status) {
            case "PENDING":
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase text-[10px]">{statusLabel}</Badge>;
            case "IN_PROGRESS":
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">{statusLabel}</Badge>;
            case "COMPLETED":
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px]">{statusLabel}</Badge>;
            case "CANCELLED":
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase text-[10px]">{statusLabel}</Badge>;
            default:
                return <Badge variant="outline" className="uppercase text-[10px]">{statusLabel}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Info className="size-5 text-primary" />
                {t('dashboard:inspections.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inspections.map((inspection) => (
                    <Card key={inspection.id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Car className="size-4 text-slate-400" />
                                    {inspection.listing.year} {inspection.listing.make} {inspection.listing.model}
                                </CardTitle>
                                {getStatusBadge(inspection.status)}
                            </div>
                            <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                                <Calendar className="size-3" />
                                {format(new Date(inspection.createdAt), "dd.MM.yyyy HH:mm")}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
