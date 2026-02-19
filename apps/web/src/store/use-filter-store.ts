import { create } from "zustand";
import {
	BodyTypeSelection,
	serializeBodyType,
	deserializeBodyType,
} from "@/lib/body-types";

export interface FilterState {
	make: string;
	model: string;
	priceMin: string;
	priceMax: string;
	yearMin: string;
	yearMax: string;
	fuelType: string[];
	transmission: string;
	// Hierarchical bodyType: stores selections as {category, subtypes[]}
	bodyTypeSelections: BodyTypeSelection[];
	color: string;
	q: string;
	sort: string;
	view: "grid" | "list";
	page: number;
	mileageMin: string;
	mileageMax: string;
	powerMin: string;
	powerMax: string;
	driveType: string;
	doors: string;
	seats: string;
	condition: string;
	location: string;
	credit: boolean;
	barter: boolean;
}

interface FilterStore extends FilterState {
	setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
	setFilters: (filters: Partial<FilterState>) => void;
	resetFilters: () => void;
	setPage: (page: number) => void;
	toggleFuelType: (fuel: string) => void;
	// Body type actions for hierarchical structure
	toggleBodyTypeCategory: (category: string) => void;
	toggleBodyTypeSubtype: (category: string, subtype: string) => void;
	isCategorySelected: (category: string) => boolean;
	isSubtypeSelected: (category: string, subtype: string) => boolean;
	getBodyTypeForApi: () => string;
	setBodyTypeFromUrl: (value: string) => void;
	clearBodyType: () => void;
}

const initialFilters: FilterState = {
	make: "",
	model: "",
	priceMin: "",
	priceMax: "",
	yearMin: "",
	yearMax: "",
	fuelType: [],
	transmission: "all",
	bodyTypeSelections: [],
	color: "",
	q: "",
	sort: "newest",
	view: "grid",
	page: 1,
	mileageMin: "",
	mileageMax: "",
	powerMin: "",
	powerMax: "",
	driveType: "",
	doors: "",
	seats: "",
	condition: "",
	location: "",
	credit: false,
	barter: false,
};

export const useFilterStore = create<FilterStore>((set, get) => ({
	...initialFilters,
	setFilter: (key, value) => {
		set((state) => ({ ...state, [key]: value, page: 1 }));
	},
	setFilters: (filters) => {
		set((state) => ({ ...state, ...filters, page: 1 }));
	},
	resetFilters: () => set(initialFilters),
	setPage: (page) => set({ page }),
	toggleFuelType: (fuel) => {
		set((state) => {
			const next = state.fuelType.includes(fuel)
				? state.fuelType.filter((f) => f !== fuel)
				: [...state.fuelType, fuel];
			return { fuelType: next, page: 1 };
		});
	},
	// Toggle entire category (selects all subtypes when selected)
	toggleBodyTypeCategory: (category) => {
		set((state) => {
			const exists = state.bodyTypeSelections.find(
				(sel) => sel.category === category
			);
			let next: BodyTypeSelection[];
			if (exists) {
				// Remove category entirely
				next = state.bodyTypeSelections.filter(
					(sel) => sel.category !== category
				);
			} else {
				// Add category with empty subtypes (means all subtypes)
				next = [...state.bodyTypeSelections, { category, subtypes: [] }];
			}
			return { bodyTypeSelections: next, page: 1 };
		});
	},
	// Toggle specific subtype within a category
	toggleBodyTypeSubtype: (category, subtype) => {
		set((state) => {
			const existing = state.bodyTypeSelections.find(
				(sel) => sel.category === category
			);
			let next: BodyTypeSelection[];

			if (!existing) {
				// Add new category with this subtype
				next = [
					...state.bodyTypeSelections,
					{ category, subtypes: [subtype] },
				];
			} else if (existing.subtypes.length === 0) {
				// Category was fully selected, now switch to specific subtypes
				// (all except the one being toggled off)
				const { getSubtypes } = require("@/lib/body-types");
				const allSubtypes = getSubtypes(category);
				next = state.bodyTypeSelections.map((sel) =>
					sel.category === category
						? {
							category,
							subtypes: allSubtypes.filter((s: string) => s !== subtype),
						}
						: sel
				);
			} else {
				// Toggle specific subtype
				const hasSubtype = existing.subtypes.includes(subtype);
				if (hasSubtype) {
					// Remove subtype
					const newSubtypes = existing.subtypes.filter((s) => s !== subtype);
					if (newSubtypes.length === 0) {
						// Remove category if no subtypes left
						next = state.bodyTypeSelections.filter(
							(sel) => sel.category !== category
						);
					} else {
						next = state.bodyTypeSelections.map((sel) =>
							sel.category === category
								? { ...sel, subtypes: newSubtypes }
								: sel
						);
					}
				} else {
					// Add subtype
					next = state.bodyTypeSelections.map((sel) =>
						sel.category === category
							? { ...sel, subtypes: [...sel.subtypes, subtype] }
							: sel
					);
				}
			}
			return { bodyTypeSelections: next, page: 1 };
		});
	},
	isCategorySelected: (category) => {
		return get().bodyTypeSelections.some((sel) => sel.category === category);
	},
	isSubtypeSelected: (category, subtype) => {
		const sel = get().bodyTypeSelections.find(
			(s) => s.category === category
		);
		if (!sel) return false;
		// If no subtypes specified, entire category is selected
		if (sel.subtypes.length === 0) return true;
		return sel.subtypes.includes(subtype);
	},
	getBodyTypeForApi: () => {
		return serializeBodyType(get().bodyTypeSelections);
	},
	setBodyTypeFromUrl: (value) => {
		set({ bodyTypeSelections: deserializeBodyType(value), page: 1 });
	},
	clearBodyType: () => {
		set({ bodyTypeSelections: [], page: 1 });
	},
}));
