import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterSidebar } from '@/components/listings/filter-sidebar';
import { useFilterStore } from '@/store/use-filter-store';

// Mock the store
vi.mock('@/store/use-filter-store', () => ({
    useFilterStore: vi.fn(),
}));

// Mock Shadcn Select to simplify testing
vi.mock('@/components/ui/select', () => ({
    Select: ({ children, value, onValueChange }: any) => (
        <select value={value} onChange={(e) => onValueChange(e.target.value)} data-testid="mock-select">
            {children}
        </select>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

describe('FilterSidebar', () => {
    const mockSetFilter = vi.fn();
    const mockResetFilters = vi.fn();
    const mockToggleFuelType = vi.fn();
    const mockToggleBodyType = vi.fn();

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
            resetFilters: mockResetFilters,
            toggleFuelType: mockToggleFuelType,
            toggleBodyType: mockToggleBodyType,
        });

        // Mock fetch for makes
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
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    it('renders filter titles', async () => {
        render(<FilterSidebar />);
        expect(screen.getByText('filters.title')).toBeInTheDocument();
        expect(screen.getByText(/filters.make/i)).toBeInTheDocument();
    });

    it('fetches makes on mount', async () => {
        render(<FilterSidebar />);
        await waitFor(() => {
            expect(screen.getByText('BMW')).toBeInTheDocument();
            expect(screen.getByText('Audi')).toBeInTheDocument();
        });
    });

    it('calls setFilter when make is changed', async () => {
        render(<FilterSidebar />);
        await waitFor(() => screen.getByText('BMW'));

        const select = screen.getAllByTestId('mock-select')[0];
        fireEvent.change(select, { target: { value: 'BMW' } });

        expect(mockSetFilter).toHaveBeenCalledWith('make', 'BMW');
    });

    it('calls resetFilters when clear button is clicked', async () => {
        render(<FilterSidebar />);
        const clearButton = screen.getByText(/filters.clear/i);
        fireEvent.click(clearButton);
        expect(mockResetFilters).toHaveBeenCalled();
    });

    it('calls setFilter when price is entered', async () => {
        render(<FilterSidebar />);
        const minPriceInput = screen.getByPlaceholderText('filters.min');
        fireEvent.change(minPriceInput, { target: { value: '5000' } });
        expect(mockSetFilter).toHaveBeenCalledWith('priceMin', '5000');
    });

    it('calls toggleFuelType when a fuel checkbox is clicked', async () => {
        render(<FilterSidebar />);
        // Fuel types are hardcoded in the component: ["Bensiin", "Diisel", ...]
        // The translation mock returns defaultValue if provided, which is "Bensiin"
        const bensiinCheckbox = screen.getByLabelText(/Bensiin/i);
        fireEvent.click(bensiinCheckbox);
        expect(mockToggleFuelType).toHaveBeenCalledWith('Bensiin');
    });
});
