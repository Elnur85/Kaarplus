"use client";

import { useFilterStore } from "@/store/use-filter-store";
import { LayoutGrid, List } from "lucide-react";


// Note: I missed adding toggle-group in the previous run. I'll add it or use buttons.
// I'll use simple buttons for now to avoid another install if not needed, 
// but wait, I just installed toggle. Shadcn toggle-group is usually separate.
// I'll just use simple button/div composition to match Stitch exactly.

export function ViewToggle() {
    const { view, setFilter } = useFilterStore();

    return (
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
            <button
                onClick={() => setFilter("view", "grid")}
                className={`p-1.5 rounded transition-colors ${view === "grid"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                title="Ruudustik"
            >
                <LayoutGrid size={18} />
            </button>
            <button
                onClick={() => setFilter("view", "list")}
                className={`p-1.5 rounded transition-colors ${view === "list"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                title="Nimekiri"
            >
                <List size={18} />
            </button>
        </div>
    );
}
