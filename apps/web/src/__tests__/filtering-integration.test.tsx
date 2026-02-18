import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FilterSidebar } from '@/components/listings/filter-sidebar';
import { useFilterStore } from '@/store/use-filter-store';

// Mock the store properly to observe calls
vi.mock('@/store/use-filter-store', () => ({
	useFilterStore: vi.fn(),
}));

// Mock Shadcn UI components
vi.mock('@/components/ui/select', () => ({
	Select: ({ children, value, onValueChange }: any) => (
		<select value={value} onChange={(e) => onValueChange(e.target.value)} data-testid="mock-select">
			{children}
		</select>
	),
	SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
	SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
	SelectContent: ({ children }: any) => <>{children}</>,
	SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

vi.mock('@/components/ui/checkbox', () => ({
	Checkbox: ({ id, checked, onCheckedChange }: any) => (
		<input
			type="checkbox"
			id={id}
			checked={checked}
			onChange={() => onCheckedChange()}
			data-testid={`checkbox-${id}`}
		/>
	),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: any) => options?.defaultValue || key,
	}),
}));

describe('Filtering Integration Audit (Frontend)', () => {
	const mockSetFilter = vi.fn();
	const mockToggleFuelType = vi.fn();
	const mockToggleBodyType = vi.fn();
	const mockResetFilters = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useFilterStore as any).mockReturnValue({
			make: '',
			model: '',
			priceMin: '',
			priceMax: '',
			yearMin: '',
			yearMax: '',
			fuelType: [],
			transmission: 'all',
			bodyType: [],
			setFilter: mockSetFilter,
			toggleFuelType: mockToggleFuelType,
			toggleBodyType: mockToggleBodyType,
			resetFilters: mockResetFilters
		});

		global.fetch = vi.fn().mockImplementation((url) => {
			if (url.includes('/api/search/makes')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: ['BMW', 'Tesla'] }),
				});
			}
			if (url.includes('/api/search/models')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: ['Model S', 'Model 3'] }),
				});
			}
			if (url.includes('/api/search/filters')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({
						data: {
							makes: ['BMW', 'Tesla'],
							fuelTypes: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
							bodyTypes: ['Sedan', 'SUV', 'Hatchback', 'Wagon'],
							transmissions: ['Manual', 'Automatic'],
							years: { min: 1990, max: 2024 },
							price: { min: 0, max: 500000 },
						}
					}),
				});
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) });
		});
	});

	it('Verifies Fuel Type selection sends correctly formatted data to the store', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		// Find the "Petrol" checkbox. It should be rendered because it's returned by the API
		const petrolCheckbox = screen.getByTestId('checkbox-fuel-Petrol');

		await act(async () => {
			fireEvent.click(petrolCheckbox);
		});

		/* 
		   AUDIT POINT: 
		   This now confirms that it sends "Petrol" (English) to the store,
		   matching the database values. The translation layer (i18n) handles
		   displaying the appropriate language to the user.
		*/
		expect(mockToggleFuelType).toHaveBeenCalledWith('Petrol');
	});

	it('Verifies Body Type selection sends correctly formatted data to the store', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		// Find the "Sedan" checkbox
		const sedanCheckbox = screen.getByTestId('checkbox-body-Sedan');

		await act(async () => {
			fireEvent.click(sedanCheckbox);
		});

		expect(mockToggleBodyType).toHaveBeenCalledWith('Sedan');
	});

	it('Verifies if Make/Model dependency works via API calls', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});

		await waitFor(() => expect(screen.getByText('Tesla')).toBeInTheDocument());

		const makeSelect = screen.getAllByTestId('mock-select')[0];

		await act(async () => {
			fireEvent.change(makeSelect, { target: { value: 'Tesla' } });
		});

		expect(mockSetFilter).toHaveBeenCalledWith('make', 'Tesla');

		// The component uses a useEffect that depends on filters.make.
		// We need to re-render or simulate the store update.
		(useFilterStore as any).mockReturnValue({
			make: 'Tesla',
			setFilter: mockSetFilter,
			toggleFuelType: mockToggleFuelType,
			toggleBodyType: mockToggleBodyType,
			resetFilters: mockResetFilters,
			fuelType: [],
			bodyType: [],
		});

		// Re-render to trigger useEffect with updated make
		await act(async () => {
			render(<FilterSidebar />);
		});

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('make=Tesla'));
		});
	});

	it('Normal Case: Clearing filters resets the store', async () => {
		await act(async () => {
			render(<FilterSidebar />);
		});
		const clearButton = screen.getByText(/filters.clear/i);

		await act(async () => {
			fireEvent.click(clearButton);
		});

		expect(mockResetFilters).toHaveBeenCalled();
	});
});
