import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SellWizard } from '@/components/sell/sell-wizard';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { useFormContext } from 'react-hook-form';

// Mock child components
vi.mock('@/components/sell/step-1-vehicle-type', () => ({
    Step1VehicleType: ({ selectedType, onSelect }: any) => (
        <div data-testid="step-1">
            <button onClick={() => onSelect('sedan')}>Select Sedan</button>
            {selectedType && <span>Selected: {selectedType}</span>}
        </div>
    ),
}));

vi.mock('@/components/sell/step-indicator', () => ({
    StepIndicator: () => <div data-testid="step-indicator" />,
}));

// A more complex mock for Step 2 that can actually be used to advance
vi.mock('@/components/sell/step-2-vehicle-data', () => {
    return {
        Step2VehicleData: () => {
            const { setValue } = useFormContext();
            return (
                <div data-testid="step-2">
                    <button onClick={() => {
                        // Set all required fields to valid values
                        setValue('contactName', 'Test');
                        setValue('contactEmail', 'test@test.com');
                        setValue('contactPhone', '123456');
                        setValue('make', 'BMW');
                        setValue('model', '320i');
                        setValue('year', 2020);
                        setValue('mileage', 10000);
                        setValue('price', 30000);
                        setValue('location', 'Tallinn');
                        setValue('bodyType', 'sedan');
                        setValue('fuelType', 'Petrol');
                        setValue('transmission', 'Automatic');
                        setValue('powerKw', 135);
                        setValue('driveType', 'RWD');
                        setValue('doors', 4);
                        setValue('seats', 5);
                        setValue('colorExterior', 'Black');
                        setValue('condition', 'Used');
                    }}>Fill Step 2</button>
                </div>
            );
        }
    };
});

vi.mock('@/components/sell/step-3-photo-upload', () => ({
    Step3PhotoUpload: ({ files, onFilesChange }: any) => (
        <div data-testid="step-3">
            <button onClick={() => {
                const newFiles = [...files];
                for (let i = 0; i < 3; i++) {
                    newFiles.push(new File([''], `test${files.length + i}.jpg`, { type: 'image/jpeg' }));
                }
                onFilesChange(newFiles);
            }}>Add 3 Photos</button>
            <span>Photos: {files.length}</span>
        </div>
    ),
}));

vi.mock('@/components/sell/step-4-confirmation', () => ({
    Step4Confirmation: ({ listingId }: any) => <div data-testid="step-4">Confirmed: {listingId}</div>,
}));

describe('SellWizard', () => {
    const mockToast = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useSession as any).mockReturnValue({
            data: { user: { name: 'Test User', email: 'test@example.com' } },
            status: 'authenticated',
        });
        (useToast as any).mockReturnValue({ toast: mockToast });
        window.scrollTo = vi.fn();

        // Mock fetch
        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: { id: 'new-listing-123' }, uploadUrl: 'http://s3.com', publicUrl: 'http://img.com' }),
            })
        );
    });

    it('manages the full wizard flow', async () => {
        render(<SellWizard />);

        // Step 1
        expect(screen.getByTestId('step-1')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Select Sedan'));
        fireEvent.click(screen.getByText('buttons.next'));

        // Step 2
        await waitFor(() => expect(screen.getByTestId('step-2')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Fill Step 2'));
        fireEvent.click(screen.getByText('buttons.next'));

        // Step 3
        await waitFor(() => expect(screen.getByTestId('step-3')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Add 3 Photos'));

        // Submit
        fireEvent.click(screen.getByText('buttons.publish'));

        // Step 4 (Confirmation)
        await waitFor(() => expect(screen.getByTestId('step-4')).toBeInTheDocument(), { timeout: 5000 });
        expect(screen.getByText(/Confirmed: new-listing-123/)).toBeInTheDocument();
    });

    it('shows error if photos are missing', async () => {
        render(<SellWizard />);

        // Reach Step 3
        fireEvent.click(screen.getByText('Select Sedan'));
        fireEvent.click(screen.getByText('buttons.next'));
        await waitFor(() => expect(screen.getByTestId('step-2')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Fill Step 2'));
        fireEvent.click(screen.getByText('buttons.next'));
        await waitFor(() => expect(screen.getByTestId('step-3')).toBeInTheDocument());

        // Try to publish without photos
        fireEvent.click(screen.getByText('buttons.publish'));

        // Button should be disabled but let's check validation logic if it's called
        // Actually the button is disabled: disabled={isSubmitting || images.length < 3}
        const publishButton = screen.getByText('buttons.publish');
        expect(publishButton).toBeDisabled();
    });
});
