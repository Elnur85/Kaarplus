import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ContactSellerDialog } from '@/components/car-detail/contact-seller-dialog';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

// Mock next-auth
vi.mock('next-auth/react', () => ({
	useSession: vi.fn(),
}));

// Mock use-toast
vi.mock('@/hooks/use-toast', () => ({
	useToast: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
	default: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

// Mock fetch
global.fetch = vi.fn();

describe('ContactSellerDialog', () => {
	const mockToast = vi.fn();
	const listingId = 'test-listing-123';
	const listingTitle = '2023 BMW X5';

	beforeEach(() => {
		vi.clearAllMocks();
		(useToast as any).mockReturnValue({ toast: mockToast });
		(useSession as any).mockReturnValue({
			data: null,
			status: 'unauthenticated',
		});
	});

	it('renders trigger button', () => {
		render(<ContactSellerDialog listingId={listingId} listingTitle={listingTitle} />);
		expect(screen.getByRole('button')).toBeInTheDocument();
	});

	it('opens dialog when button is clicked', async () => {
		render(<ContactSellerDialog listingId={listingId} listingTitle={listingTitle} />);

		fireEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});
	});

	it('shows form with all fields', async () => {
		render(<ContactSellerDialog listingId={listingId} listingTitle={listingTitle} />);

		fireEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
			expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
			expect(screen.getByRole('textbox', { name: /phone/i })).toBeInTheDocument();
			expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
		});
	});

	it('submits form successfully', async () => {
		(fetch as any).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});

		render(<ContactSellerDialog listingId={listingId} listingTitle={listingTitle} />);

		fireEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		// Fill in the form
		fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
			target: { value: 'John Doe' }
		});
		fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
			target: { value: 'john@example.com' }
		});
		fireEvent.change(screen.getByRole('textbox', { name: /message/i }), {
			target: { value: 'I am interested in this car' }
		});

		// Submit the form
		const submitButton = screen.getByRole('button', { name: /send/i });
		await act(async () => {
			fireEvent.click(submitButton);
		});

		await waitFor(() => {
			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining(`/api/listings/${listingId}/contact`),
				expect.objectContaining({
					method: 'POST',
				})
			);
		});
	});

	it('hides contact fields when logged in (uses session)', async () => {
		(useSession as any).mockReturnValue({
			data: {
				user: {
					name: 'Jane Doe',
					email: 'jane@example.com',
				},
			},
			status: 'authenticated',
		});

		render(<ContactSellerDialog listingId={listingId} listingTitle={listingTitle} />);

		fireEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			expect(screen.queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
			expect(screen.queryByRole('textbox', { name: /email/i })).not.toBeInTheDocument();
		});
	});
});
