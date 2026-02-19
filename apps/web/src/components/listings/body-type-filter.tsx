"use client";

import { useState } from "react";
import { useFilterStore } from "@/store/use-filter-store";
import { BODY_TYPE_HIERARCHY, getSubtypes } from "@/lib/body-types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface BodyTypeFilterProps {
	isLoading?: boolean;
}

export function BodyTypeFilter({ isLoading }: BodyTypeFilterProps) {
	const { t } = useTranslation(["listings", "bodyTypes"]);
	const filters = useFilterStore();
	const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

	const toggleCategoryExpand = (category: string) => {
		setExpandedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	const handleCategoryToggle = (category: string) => {
		filters.toggleBodyTypeCategory(category);
	};

	const handleSubtypeToggle = (category: string, subtype: string) => {
		filters.toggleBodyTypeSubtype(category, subtype);
	};

	const isCategorySelected = (category: string) => {
		return filters.isCategorySelected(category);
	};

	const isSubtypeSelected = (category: string, subtype: string) => {
		return filters.isSubtypeSelected(category, subtype);
	};

	// Check if category is partially selected (some subtypes but not all)
	const isPartiallySelected = (category: string) => {
		const sel = filters.bodyTypeSelections.find(
			(s) => s.category === category
		);
		if (!sel) return false;
		if (sel.subtypes.length === 0) return false; // All selected
		const allSubtypes = getSubtypes(category);
		return sel.subtypes.length > 0 && sel.subtypes.length < allSubtypes.length;
	};

	if (isLoading) {
		return (
			<div className="text-sm text-slate-500">{t("common:common.loading")}</div>
		);
	}

	return (
		<div className="space-y-1">
			{BODY_TYPE_HIERARCHY.map((category) => {
				const isSelected = isCategorySelected(category.key);
				const isPartial = isPartiallySelected(category.key);
				const isExpanded = expandedCategories.includes(category.key);
				const subtypes = category.subtypes;

				return (
					<div key={category.key} className="border rounded-lg overflow-hidden">
						{/* Category Header */}
						<div
							role="button"
							tabIndex={0}
							onClick={() => toggleCategoryExpand(category.key)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									toggleCategoryExpand(category.key);
								}
							}}
							className={cn(
								"w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer",
								"hover:bg-slate-50 dark:hover:bg-slate-800",
								isSelected && "bg-primary/5 dark:bg-primary/10"
							)}
						>
							{/* Checkbox for category */}
							<div
								onClick={(e) => {
									e.stopPropagation();
									handleCategoryToggle(category.key);
								}}
								className="flex items-center"
							>
								<Checkbox
									checked={isSelected}
									data-state={isPartial ? "indeterminate" : isSelected ? "checked" : "unchecked"}
									className={cn(isPartial && "opacity-70")}
								/>
							</div>

							{/* Category Label */}
							<span className="flex-1 font-medium text-sm">
								{t(`bodyTypes:categories.${category.key}`)}
							</span>

							{/* Expand Icon */}
							{isExpanded ? (
								<ChevronDown size={16} className="text-slate-400" />
							) : (
								<ChevronRight size={16} className="text-slate-400" />
							)}
						</div>

						{/* Subtypes */}
						{isExpanded && (
							<div className="px-3 pb-2 pt-1 bg-slate-50/50 dark:bg-slate-800/30">
								<div className="grid grid-cols-1 gap-1 pl-6">
									{subtypes.map((subtype) => (
										<div
											key={subtype}
											className="flex items-center gap-2 py-1"
										>
											<Checkbox
												id={`${category.key}-${subtype}`}
												checked={isSubtypeSelected(category.key, subtype)}
												onCheckedChange={() =>
													handleSubtypeToggle(category.key, subtype)
												}
											/>
											<Label
												htmlFor={`${category.key}-${subtype}`}
												className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary transition-colors"
											>
												{t(`bodyTypes:subtypes.${subtype}`, {
													defaultValue: subtype,
												})}
											</Label>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
