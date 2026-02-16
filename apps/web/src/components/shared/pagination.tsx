"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, isLoading }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pageButtonClass = (isActive: boolean) =>
        cn(
            "w-10 h-10 rounded-lg font-bold transition-colors",
            isActive
                ? "bg-primary text-white hover:bg-primary/90"
                : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
        );

    const renderPageButtons = () => {
        const pages = [];
        const showThreshold = 2;

        pages.push(
            <button
                key={1}
                className={pageButtonClass(currentPage === 1)}
                onClick={() => onPageChange(1)}
                disabled={isLoading}
            >
                1
            </button>
        );

        if (currentPage > showThreshold + 2) {
            pages.push(<span key="dots-start" className="px-2 text-slate-400">...</span>);
        }

        for (
            let i = Math.max(2, currentPage - showThreshold);
            i <= Math.min(totalPages - 1, currentPage + showThreshold);
            i++
        ) {
            pages.push(
                <button
                    key={i}
                    className={pageButtonClass(currentPage === i)}
                    onClick={() => onPageChange(i)}
                    disabled={isLoading}
                >
                    {i}
                </button>
            );
        }

        if (currentPage < totalPages - showThreshold - 1) {
            pages.push(<span key="dots-end" className="px-2 text-slate-400">...</span>);
        }

        if (totalPages > 1) {
            pages.push(
                <button
                    key={totalPages}
                    className={pageButtonClass(currentPage === totalPages)}
                    onClick={() => onPageChange(totalPages)}
                    disabled={isLoading}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="flex items-center gap-2">
            <button
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
            >
                <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
                {renderPageButtons()}
            </div>

            <button
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
