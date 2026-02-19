import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FilterSidebar } from '@/components/listings/filter-sidebar';
import { useFilterStore } from '@/store/use-filter-store';

// Mock the store
vi.mock('@/store/use-filter-store', () => ({
	useFilterStore: vi.fn(),
}));

// Mock Shadcn Select to simplify testing
vi.mock('@/components/ui/select', () => ({
	Select: ({ children, value, onValueChange, disabled }: any) => (
		<select
			value={value}
			onChange={(e) => onValueChange && onValueChange(e.target.value)}
			data-testid="mock-select"
			disabled={disabled}
		>
			{children}
		</select>
	),
	SelectTrigger: ({ children }: any) => <div>{children}</div>,
	SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
	SelectContent: ({ children }: any) => <>{children}</>,
	SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

// Mock Checkbox
vi.mock('@/components/ui/checkbox', () => ({
	Checkbox: ({ id, checked, onCheckedChange }: any) => (
		<input
			type="checkbox"
			id={id}
			checked={checked}
			onChange={() => onCheckedChange && onCheckedChange()}
			data-testid={`checkbox-${id}`}
		/>
	),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: any) => {
			if (typeof key === 'string') {
				// Some components pass 'namespace:key', so we normalize to just the key part
				return key.split(':').pop() || key;
			}
			return key;
		},
	}),
}));

// Mock body types library
vi.mock('@/lib/body-types', () => ({
	BODY_TYPE_HIERARCHY: [
		{
			key: 'passengerCar',
			subtypes: ['sedan', 'hatchback', 'wagon']
		},
		{
			key: 'suv',
			subtypes: ['compact', 'midsize', 'fullsize']
		}
	],
	getSubtypes: (category: string) => {
		if (category === 'passengerCar') return ['sedan', 'hatchback', 'wagon'];
		if (category === 'suv') return ['compact', 'midsize', 'fullsize'];
		return [];
	},
	serializeBodyType: vi.fn(),
	deserializeBodyType: vi.fn(),
	flattenBodyTypeSelections: vi.fn()
}));

describe('FilterSidebar', () => {
	const mockSetFilter = vi.fn();
	const mockResetFilters = vi.fn();
	const mockToggleFuelType = vi.fn();
	const mockToggleBodyType = vi.fn();
	const mockToggleBodyTypeSubtype = vi.fn(); // Added for subtype testing
	const mockSetPage = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers({ shouldAdvanceTime: true });
		(useFilterStore as any).mockReturnValue({
			make: '',
			model: '',
			priceMin: '',
			priceMax: '',
			yearMin: '',
			yearMax: '',
			fuelType: [],
			transmission: 'all',
			bodyTypeSelections: [],
			mileageMin: '',
			mileageMax: '',
			powerMin: '',
			powerMax: '',
			driveType: '',
			doors: '',
			seats: '',
			condition: '',
			location: '',
			color: '',
			q: '',
			sort: 'newest',
			view: 'grid',
			page: 1,
			setFilter: mockSetFilter,
			resetFilters: mockResetFilters,
			toggleFuelType: mockToggleFuelType,
			toggleBodyTypeCategory: mockToggleBodyType,
			toggleBodyTypeSubtype: mockToggleBodyTypeSubtype, // Used the new mock spy
			isCategorySelected: () => false,
			isSubtypeSelected: () => false,
			setPage: mockSetPage,
		});

		// Mock fetch for makes, models, and filter options
		global.fetch = vi.fn().mockImplementation((url) => {
			if (url.includes('/makes')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: ['BMW', 'Audi'] }),
				});
			}
			if (url.includes('/models')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: ['320i', '330i'] }),
				});
			}
			if (url.includes('/filters')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({
						data: {
							makes: ['BMW', 'Audi'],
							fuelTypes: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
							bodyTypes: {
								passengerCar: {
									label: 'Passenger Car',
									subtypes: ['sedan', 'hatchback', 'wagon']
								},
								suv: {
									label: 'SUV',
									subtypes: ['compact', 'midsize', 'fullsize']
								}
							},
							transmissions: ['Manual', 'Automatic'],
							years: { min: 1990, max: 2024 },
							price: { min: 0, max: 500000 },
						}
					}),
				});
			}
			return Promise.reject(new Error('Unknown URL'));
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders filter titles', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});
		expect(screen.getByText('filters.title')).toBeInTheDocument();
		expect(screen.getByText(/filters.make/i)).toBeInTheDocument();
	});

	it('fetches makes on mount', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		// Expand the Make & Model section
		const makeModelSection = screen.getByText('filters.make & filters.model');
		await act(async () => {
			fireEvent.click(makeModelSection);
		});

		await waitFor(() => {
			expect(screen.getByText('BMW')).toBeInTheDocument();
			expect(screen.getByText('Audi')).toBeInTheDocument();
		});
	});

	it('fetches filter options on mount', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		// Expand Fuel Type category
		const fuelTypeSection = screen.getByText('filters.fuelType');
		await act(async () => {
			fireEvent.click(fuelTypeSection);
		});

		await waitFor(() => {
			// Check that fuel types from API are rendered
			expect(screen.getByText('options.fuel.Petrol')).toBeInTheDocument();
			expect(screen.getByText('options.fuel.Diesel')).toBeInTheDocument();
			// Check that body type categories are rendered
			expect(screen.getByText('categories.passengerCar')).toBeInTheDocument();
			expect(screen.getByText('categories.suv')).toBeInTheDocument();
		});
	});

	it('calls setFilter when make is changed', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		// Expand the Make & Model section
		const makeModelSection = screen.getByText('filters.make & filters.model');
		await act(async () => {
			fireEvent.click(makeModelSection);
		});

		await waitFor(() => screen.getByText('BMW'));

		const selects = screen.getAllByTestId('mock-select');
		const makeSelect = selects[0];

		await act(async () => {
			fireEvent.change(makeSelect, { target: { value: 'BMW' } });
		});

		expect(mockSetFilter).toHaveBeenCalledWith('make', 'BMW');
	});

	it('calls resetFilters when clear button is clicked', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});
		const clearButton = screen.getByText(/filters.clear/i);
		fireEvent.click(clearButton);
		expect(mockResetFilters).toHaveBeenCalled();
	});

	it('calls setFilter with debounced value when price is entered', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		// Expand Price Range section
		const priceSection = screen.getByText('filters.price (€)');
		await act(async () => {
			fireEvent.click(priceSection);
		});

		// Get all inputs with placeholder 'filters.min' - there are multiple (price, mileage)
		const minInputs = screen.getAllByPlaceholderText('filters.min');
		const minPriceInput = minInputs[0]; // First one is price

		await act(async () => {
			fireEvent.change(minPriceInput, { target: { value: '5000' } });
		});

		// Should not be called immediately due to debounce
		expect(mockSetFilter).not.toHaveBeenCalled();

		// Fast-forward timers
		await act(async () => {
			vi.advanceTimersByTime(600);
		});

		// Now it should be called
		await waitFor(() => {
			expect(mockSetFilter).toHaveBeenCalledWith('priceMin', '5000');
		});
	});

	it('calls toggleFuelType when a fuel checkbox is clicked', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		// Expand Fuel Type category
		const fuelTypeSection = screen.getByText('filters.fuelType');
		await act(async () => {
			fireEvent.click(fuelTypeSection);
		});

		// Wait for fuel types to load (mocked checkbox)
		await waitFor(() => screen.getByTestId('checkbox-fuel-Petrol'));

		// Find and click the Petrol checkbox
		const petrolCheckbox = screen.getByTestId('checkbox-fuel-Petrol');
		fireEvent.click(petrolCheckbox);

		expect(mockToggleFuelType).toHaveBeenCalledWith('Petrol');
	});

	it('calls toggleBodyType when a body type checkbox is clicked', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		// Wait for body types to load
		await waitFor(() => screen.getByText('categories.passengerCar'));

		// Expand passengerCar category
		const expandButton = screen.getByText('categories.passengerCar');
		await act(async () => {
			fireEvent.click(expandButton);
		});

		// Find and click the Sedan checkbox (which is a subtype under passengerCar)
		const sedanCheckbox = screen.getByTestId('checkbox-passengerCar-sedan');
		fireEvent.click(sedanCheckbox);

		expect(mockToggleBodyTypeSubtype).toHaveBeenCalledWith('passengerCar', 'sedan');
	});

	it('disables model select when no make is selected', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		// Expand the Make & Model section
		const makeModelSection = screen.getByText('filters.make & filters.model');
		await act(async () => {
			fireEvent.click(makeModelSection);
		});

		const selects = screen.getAllByTestId('mock-select');
		// Model select should be the second one and disabled when no make
		const modelSelect = selects[1];
		expect(modelSelect).toBeDisabled();
	});
});
