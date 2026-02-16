import { create } from "zustand";

export interface FilterState {
    make: string;
    model: string;
    priceMin: string;
    priceMax: string;
    yearMin: string;
    yearMax: string;
    fuelType: string[];
    transmission: string;
    bodyType: string[];
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
}

interface FilterStore extends FilterState {
    setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    resetFilters: () => void;
    setPage: (page: number) => void;
    toggleFuelType: (fuel: string) => void;
    toggleBodyType: (body: string) => void;
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
    bodyType: [],
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
};

export const useFilterStore = create<FilterStore>((set) => ({
    ...initialFilters,
    setFilter: (key, value) => {
        set((state) => ({ ...state, [key]: value, page: 1 }));
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
    toggleBodyType: (body) => {
        set((state) => {
            const next = state.bodyType.includes(body)
                ? state.bodyType.filter((b) => b !== body)
                : [...state.bodyType, body];
            return { bodyType: next, page: 1 };
        });
    },
}));
