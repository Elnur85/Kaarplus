"use client";

import { useTranslation } from "react-i18next";

export function InactiveListing() {
    const { t } = useTranslation("checkout");
    return (
        <div className="container py-20 text-center">
            <h1 className="text-2xl font-bold mb-4">{t("page.inactive.title")}</h1>
            <p className="text-muted-foreground">{t("page.inactive.description")}</p>
        </div>
    );
}
