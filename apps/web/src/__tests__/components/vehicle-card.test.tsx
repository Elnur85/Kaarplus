import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VehicleCard } from '@/components/shared/vehicle-card';
import { useFavoritesStore } from '@/store/use-favorites-store';
import { useSession } from 'next-auth/react';

// Mock the store
vi.mock('@/store/use-favorites-store', () => ({
    useFavoritesStore: vi.fn(),
}));

// Mock SpecIcons since it's a child component with icons
vi.mock('@/components/shared/spec-icons', () => ({
    SpecIcons: () => <div data-testid="spec-icons">SpecIcons</div>,
}));

describe('VehicleCard', () => {
    const mockVehicle = {
        id: '1',
        make: 'BMW',
        model: '320i',
        year: 2020,
        price: 35000,
        mileage: 50000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        thumbnailUrl: 'https://test.com/img.jpg',
        createdAt: new Date().toISOString(),
        location: 'Tallinn',
        status: 'ACTIVE',
        variant: 'M-Sport',
    } as any;

    const mockToggleFavorite = vi.fn();
    const mockIsFavorite = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useFavoritesStore as any).mockReturnValue({
            toggleFavorite: mockToggleFavorite,
            isFavorite: mockIsFavorite,
        });
        (useSession as any).mockReturnValue({
            data: { user: { id: 'user-1' } },
            status: 'authenticated',
        });
    });

    it('renders vehicle details correctly', () => {
        render(<VehicleCard vehicle={mockVehicle} />);
        expect(screen.getByText(/2020 BMW 320i/i)).toBeInTheDocument();
        expect(screen.getByText(/M-Sport/i)).toBeInTheDocument();
        expect(screen.getByText(/35/)).toBeInTheDocument(); // Price component check
    });

    it('calls toggleFavorite when heart button is clicked', async () => {
        render(<VehicleCard vehicle={mockVehicle} />);
        const heartButton = screen.getByLabelText(/listings:favorites.add/i);
        fireEvent.click(heartButton);
        expect(mockToggleFavorite).toHaveBeenCalledWith(mockVehicle.id);
    });

    it('shows filled heart when favorited', () => {
        mockIsFavorite.mockReturnValue(true);
        render(<VehicleCard vehicle={mockVehicle} />);
        const heartButton = screen.getByLabelText(/listings:favorites.remove/i);
        expect(heartButton.querySelector('svg')).toHaveClass('fill-current');
    });

    it('renders as list variant', () => {
        render(<VehicleCard vehicle={mockVehicle} variant="list" />);
        expect(screen.getByText('Tallinn')).toBeInTheDocument();
    });

    it('shows sponsored badge', () => {
        render(<VehicleCard vehicle={mockVehicle} sponsored={true} />);
        expect(screen.getByText('listings:badges.sponsored')).toBeInTheDocument();
    });
});
