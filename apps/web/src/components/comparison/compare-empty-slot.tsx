"use client";

import { Plus } from "lucide-react";

interface CompareEmptySlotProps {
    onClick: () => void;
}

import { useTranslation } from "react-i18next";

export function CompareEmptySlot({ onClick }: CompareEmptySlotProps) {
    const { t } = useTranslation('compare');
    return (
        <button
            onClick={onClick}
            className="bg-card/50 p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary/50 transition-colors min-h-[160px]"
        >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Plus size={20} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">
                {t('buttons.addVehicle')}
            </span>
        </button>
    );
}
