"use client";

import { useTranslation } from "react-i18next";
import { MyInspectionsList } from "@/components/inspection/my-inspections-list";

export default function InspectionsPage() {
    const { t } = useTranslation('inspection');
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground mt-1">{t('description')}</p>
            </div>
            <MyInspectionsList />
        </div>
    );
}

