import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/login-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mock next-auth/react specifically
vi.mock('next-auth/react', () => ({
    signIn: vi.fn(),
    getSession: vi.fn(() => Promise.resolve({ user: { role: 'USER' } })),
}));

// Mock use-toast specifically
vi.mock('@/hooks/use-toast', () => ({
    useToast: vi.fn(() => ({
        toast: vi.fn(),
    })),
}));

describe('LoginForm', () => {
    const mockPush = vi.fn();
    const mockRefresh = vi.fn();
    const { toast } = (useToast as any)();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue({
            push: mockPush,
            refresh: mockRefresh,
        });
    });

    it('renders login form correctly', () => {
        render(<LoginForm />);
        expect(screen.getByText('login.title')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('login.emailPlaceholder')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('login.passwordPlaceholder')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login.submit/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        render(<LoginForm />);
        const submitButton = screen.getByRole('button', { name: /login.submit/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Zod messages for empty fields if not overridden
            expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
            expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
        });
    });

    it('calls signIn when form is submitted with valid data', async () => {
        (signIn as any).mockResolvedValue({ error: null });
        render(<LoginForm />);

        fireEvent.change(screen.getByPlaceholderText('login.emailPlaceholder'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('login.passwordPlaceholder'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: /login.submit/i }));

        await waitFor(() => {
            expect(signIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
                email: 'test@example.com',
                password: 'password123',
            }));
        });
    });

    it('handles sign in error', async () => {
        const mockToast = vi.fn();
        (useToast as any).mockReturnValue({ toast: mockToast });
        (signIn as any).mockResolvedValue({ error: 'CredentialsSignin' });

        render(<LoginForm />);

        fireEvent.change(screen.getByPlaceholderText('login.emailPlaceholder'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('login.passwordPlaceholder'), {
            target: { value: 'wrong-password' },
        });

        fireEvent.click(screen.getByRole('button', { name: /login.submit/i }));

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                variant: 'destructive',
                title: 'errors.loginFailed',
            }));
        });
    });
});
