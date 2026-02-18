import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ShareButton } from '@/components/shared/share-button';
import { useToast } from '@/hooks/use-toast';

// Mock use-toast
vi.mock('@/hooks/use-toast', () => ({
    useToast: vi.fn(),
}));

describe('ShareButton', () => {
    const mockToast = vi.fn();
    const title = 'Test Listing';
    const url = '/listings/test-123';

    beforeEach(() => {
        vi.clearAllMocks();
        (useToast as any).mockReturnValue({ toast: mockToast });
        
        // Reset navigator mocks
        Object.defineProperty(window, 'navigator', {
            value: {
                share: undefined,
                clipboard: {
                    writeText: vi.fn().mockResolvedValue(undefined),
                },
            },
            writable: true,
            configurable: true,
        });
    });

    it('renders share button', () => {
        render(<ShareButton title={title} url={url} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('opens dialog when clicked (when navigator.share is not available)', async () => {
        render(<ShareButton title={title} url={url} />);
        
        fireEvent.click(screen.getByRole('button'));
        
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    it('shows social share buttons in dialog', async () => {
        render(<ShareButton title={title} url={url} />);
        
        fireEvent.click(screen.getByRole('button'));
        
        await waitFor(() => {
            expect(screen.getByText('Facebook')).toBeInTheDocument();
            expect(screen.getByText('Twitter')).toBeInTheDocument();
            expect(screen.getByText('LinkedIn')).toBeInTheDocument();
            expect(screen.getByText('Email')).toBeInTheDocument();
        });
    });

    it('shows copy link input in dialog', async () => {
        render(<ShareButton title={title} url={url} />);
        
        fireEvent.click(screen.getByRole('button'));
        
        await waitFor(() => {
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });
    });

    it('handles share dialog correctly', async () => {
        // When navigator.share is not available, dialog should open
        render(<ShareButton title={title} url={url} />);
        
        fireEvent.click(screen.getByRole('button'));
        
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
        
        // Dialog should contain copy link input
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
});
