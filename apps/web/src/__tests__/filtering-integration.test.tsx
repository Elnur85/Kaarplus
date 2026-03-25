import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

import { FilterSidebar } from "@/components/listings/filter-sidebar";
import { useVehicleTaxonomy } from "@/hooks/use-vehicle-taxonomy";
import { useFilterStore } from "@/store/use-filter-store";

vi.mock("@/store/use-filter-store", () => ({
	useFilterStore: vi.fn(),
}));

vi.mock("@/hooks/use-vehicle-taxonomy", () => ({
	useVehicleTaxonomy: vi.fn(),
}));

vi.mock("@/components/ui/select", () => ({
	Select: ({ children, value, onValueChange, disabled }: any) => (
		<select
			value={value}
			onChange={(e) => onValueChange?.(e.target.value)}
			data-testid="mock-select"
			disabled={disabled}
		>
			{children}
		</select>
	),
	SelectTrigger: () => null,
	SelectValue: () => null,
	SelectContent: ({ children }: any) => <>{children}</>,
	SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

vi.mock("@/components/ui/checkbox", () => ({
	Checkbox: ({ id, checked, onCheckedChange }: any) => (
		<input
			type="checkbox"
			id={id}
			checked={checked}
			onChange={() => onCheckedChange?.()}
			data-testid={`checkbox-${id ?? "category"}`}
		/>
	),
}));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key.split(":").pop() || key,
	}),
}));

describe("Filtering Integration Audit (Frontend)", () => {
	const mockSetFilter = vi.fn();
	const mockToggleFuelType = vi.fn();
	const mockToggleBodyTypeCategory = vi.fn();
	const mockToggleBodyTypeSubtype = vi.fn();
	const mockResetFilters = vi.fn();
	const mockSetPage = vi.fn();

	const createFilterStore = (overrides: Record<string, unknown> = {}) => {
		const bodyTypeSelections = (
			overrides.bodyTypeSelections as Array<{
				category: string;
				subtypes: string[];
			}> | undefined
		) ?? [{ category: "passengerCar", subtypes: ["sedan"] }];

		return {
			make: "",
			model: "",
			priceMin: "",
			priceMax: "",
			yearMin: "",
			yearMax: "",
			fuelType: [],
			transmission: "all",
			bodyTypeSelections,
			mileageMin: "",
			mileageMax: "",
			powerMin: "",
			powerMax: "",
			driveType: "",
			doors: "",
			seats: "",
			condition: "",
			location: "",
			color: "",
			q: "",
			sort: "newest",
			view: "grid",
			page: 1,
			credit: false,
			barter: false,
			setFilter: mockSetFilter,
			toggleFuelType: mockToggleFuelType,
			toggleBodyTypeCategory: mockToggleBodyTypeCategory,
			toggleBodyTypeSubtype: mockToggleBodyTypeSubtype,
			isCategorySelected: (category: string) =>
				bodyTypeSelections.some((selection) => selection.category === category),
			isSubtypeSelected: (category: string, subtype: string) => {
				const selection = bodyTypeSelections.find(
					(item) => item.category === category
				);
				if (!selection) return false;
				if (selection.subtypes.length === 0) return true;
				return selection.subtypes.includes(subtype);
			},
			resetFilters: mockResetFilters,
			setPage: mockSetPage,
			...overrides,
		};
	};

	beforeEach(() => {
		vi.clearAllMocks();

		(useFilterStore as any).mockReturnValue(createFilterStore());

		(useVehicleTaxonomy as any).mockImplementation(
			({ make }: { make?: string }) => ({
				taxonomy: {
					makes: ["BMW", "Tesla"],
					fuelTypes: ["Petrol", "Diesel", "Hybrid", "Electric"],
					bodyTypes: ["passengerCar:sedan", "suv:coupe"],
					transmissions: ["Manual", "Automatic"],
					driveTypes: ["RWD", "AWD"],
					colors: ["Black", "White"],
					locations: ["Tallinn", "Tartu"],
					bodyTypeHierarchy: [
						{ category: "passengerCar", subtypes: ["sedan", "hatchback"] },
						{ category: "suv", subtypes: ["coupe"] },
					],
					years: { min: 1990, max: 2024 },
					price: { min: 0, max: 500000 },
				},
				models: make === "Tesla" ? ["Model S", "Model 3"] : [],
				isLoading: false,
				isLoadingModels: false,
				error: null,
				modelError: null,
				retry: vi.fn(),
			})
		);
	});

	it("sends canonical fuel values to the store", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		await act(async () => {
			fireEvent.click(screen.getByText("filters.fuelType"));
		});

		fireEvent.click(screen.getByTestId("checkbox-fuel-Petrol"));
		expect(mockToggleFuelType).toHaveBeenCalledWith("Petrol");
	});

	it("sends canonical hierarchical body type values to the store", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		await waitFor(() =>
			expect(screen.getByText("categories.passengerCar")).toBeInTheDocument()
		);

		await act(async () => {
			fireEvent.click(screen.getByText("categories.passengerCar"));
		});

		fireEvent.click(screen.getByTestId("checkbox-passengerCar-sedan"));

		expect(mockToggleBodyTypeSubtype).toHaveBeenCalledWith(
			"passengerCar",
			"sedan",
			["sedan", "hatchback"]
		);
	});

	it("keeps make/model dependency wired through taxonomy data", async () => {
		let rerender: ReturnType<typeof render>["rerender"];

		await act(async () => {
			({ rerender } = render(<FilterSidebar />));
		});

		await act(async () => {
			fireEvent.click(screen.getByText("filters.make & filters.model"));
		});

		const makeSelect = screen.getAllByTestId("mock-select")[0];
		await act(async () => {
			fireEvent.change(makeSelect, { target: { value: "Tesla" } });
		});

		expect(mockSetFilter).toHaveBeenCalledWith("make", "Tesla");

		(useFilterStore as any).mockReturnValue(
			createFilterStore({
				make: "Tesla",
				bodyTypeSelections: [],
			})
		);

		await act(async () => {
			rerender(<FilterSidebar />);
		});

		await waitFor(() => {
			expect(useVehicleTaxonomy).toHaveBeenCalledWith({
				scope: "active",
				make: "Tesla",
			});
			expect(screen.getByText("Model S")).toBeInTheDocument();
		});
	});

	it("keeps filter reset wiring intact", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		await act(async () => {
			fireEvent.click(screen.getByText(/filters.clear/i));
		});

		expect(mockResetFilters).toHaveBeenCalled();
	});
});
