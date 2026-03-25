import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

describe("FilterSidebar", () => {
	const mockSetFilter = vi.fn();
	const mockResetFilters = vi.fn();
	const mockToggleFuelType = vi.fn();
	const mockToggleBodyTypeCategory = vi.fn();
	const mockToggleBodyTypeSubtype = vi.fn();
	const mockSetPage = vi.fn();

	const buildFilterStore = (overrides: Record<string, unknown> = {}) => ({
		make: "",
		model: "",
		priceMin: "",
		priceMax: "",
		yearMin: "",
		yearMax: "",
		fuelType: [],
		transmission: "all",
		bodyTypeSelections: [],
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
		resetFilters: mockResetFilters,
		toggleFuelType: mockToggleFuelType,
		toggleBodyTypeCategory: mockToggleBodyTypeCategory,
		toggleBodyTypeSubtype: mockToggleBodyTypeSubtype,
		isCategorySelected: () => false,
		isSubtypeSelected: () => false,
		setPage: mockSetPage,
		...overrides,
	});

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers({ shouldAdvanceTime: true });

		(useFilterStore as any).mockReturnValue(buildFilterStore());

		(useVehicleTaxonomy as any).mockReturnValue({
			taxonomy: {
				makes: ["BMW", "Audi"],
				fuelTypes: ["Petrol", "Diesel"],
				bodyTypes: ["passengerCar:sedan", "suv:coupe"],
				transmissions: ["Automatic", "Manual"],
				driveTypes: ["AWD", "FWD"],
				colors: ["Black", "White"],
				locations: ["Tallinn", "Tartu"],
				bodyTypeHierarchy: [
					{ category: "passengerCar", subtypes: ["sedan", "hatchback"] },
					{ category: "suv", subtypes: ["coupe"] },
				],
				years: { min: 1990, max: 2024 },
				price: { min: 0, max: 500000 },
			},
			models: ["320i", "330i"],
			isLoading: false,
			isLoadingModels: false,
			error: null,
			modelError: null,
			retry: vi.fn(),
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders filter titles", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		expect(screen.getByText("filters.title")).toBeInTheDocument();
		expect(screen.getByText(/filters.make/i)).toBeInTheDocument();
	});

	it("renders taxonomy-backed make options", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		const makeModelSection = screen.getByText("filters.make & filters.model");
		await act(async () => {
			fireEvent.click(makeModelSection);
		});

		expect(screen.getByText("BMW")).toBeInTheDocument();
		expect(screen.getByText("Audi")).toBeInTheDocument();
	});

	it("renders taxonomy-backed filter options", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		const fuelTypeSection = screen.getByText("filters.fuelType");
		await act(async () => {
			fireEvent.click(fuelTypeSection);
		});

		expect(screen.getByText("options.fuel.Petrol")).toBeInTheDocument();
		expect(screen.getByText("options.fuel.Diesel")).toBeInTheDocument();
		expect(screen.getByText("categories.passengerCar")).toBeInTheDocument();
		expect(screen.getByText("categories.suv")).toBeInTheDocument();
	});

	it("calls setFilter when make is changed", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		const makeModelSection = screen.getByText("filters.make & filters.model");
		await act(async () => {
			fireEvent.click(makeModelSection);
		});

		const selects = screen.getAllByTestId("mock-select");
		const makeSelect = selects[0];

		await act(async () => {
			fireEvent.change(makeSelect, { target: { value: "BMW" } });
		});

		expect(mockSetFilter).toHaveBeenCalledWith("make", "BMW");
	});

	it("calls resetFilters when clear button is clicked", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		fireEvent.click(screen.getByText(/filters.clear/i));
		expect(mockResetFilters).toHaveBeenCalled();
	});

	it("calls setFilter with a debounced price value", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		const priceSection = screen.getByText("filters.price (€)");
		await act(async () => {
			fireEvent.click(priceSection);
		});

		const minInputs = screen.getAllByPlaceholderText("filters.min");
		const minPriceInput = minInputs[0];

		await act(async () => {
			fireEvent.change(minPriceInput, { target: { value: "5000" } });
		});

		expect(mockSetFilter).not.toHaveBeenCalledWith("priceMin", "5000");

		await act(async () => {
			vi.advanceTimersByTime(600);
		});

		await waitFor(() => {
			expect(mockSetFilter).toHaveBeenCalledWith("priceMin", "5000");
		});
	});

	it("calls toggleFuelType when a fuel checkbox is clicked", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		const fuelTypeSection = screen.getByText("filters.fuelType");
		await act(async () => {
			fireEvent.click(fuelTypeSection);
		});

		fireEvent.click(screen.getByTestId("checkbox-fuel-Petrol"));
		expect(mockToggleFuelType).toHaveBeenCalledWith("Petrol");
	});

	it("calls toggleBodyTypeSubtype with available subtypes", async () => {
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

	it("disables model select when no make is selected", async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		const makeModelSection = screen.getByText("filters.make & filters.model");
		await act(async () => {
			fireEvent.click(makeModelSection);
		});

		const selects = screen.getAllByTestId("mock-select");
		expect(selects[1]).toBeDisabled();
	});
});
