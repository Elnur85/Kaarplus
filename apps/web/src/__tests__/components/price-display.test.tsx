import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceDisplay } from '@/components/shared/price-display';

describe('PriceDisplay', () => {
    it('formats integer price correctly (35900 → "35 900 € (km-ga)")', () => {
        render(<PriceDisplay price={35900} />);
        // Note: Intl.NumberFormat might use non-breaking space (char code 160 or 8239)
        // We can test for the presence of the number and the Euro symbol
        const text = screen.getByText(/35/);
        expect(text).toHaveTextContent(/35/);
        expect(text).toHaveTextContent(/900/);
        expect(text).toHaveTextContent(/€/);
        expect(text).toHaveTextContent(/\(km-ga\)/);
    });

    it('handles zero price', () => {
        render(<PriceDisplay price={0} />);
        const text = screen.getByText(/0/);
        expect(text).toHaveTextContent(/0/);
        expect(text).toHaveTextContent(/€/);
    });

    it('shows VAT excluded when specified', () => {
        render(<PriceDisplay price={1000} includeVat={false} />);
        const text = screen.getByText(/\(km-ta\)/);
        expect(text).toBeInTheDocument();
    });

    it('uses tabular-nums class', () => {
        render(<PriceDisplay price={1000} />);
        const element = screen.getByText(/1/);
        expect(element).toHaveClass('tabular-nums');
    });

    it('applies size classes correctly', () => {
        const { rerender } = render(<PriceDisplay price={1000} size="sm" />);
        expect(screen.getByText(/1/)).toHaveClass('text-lg');

        rerender(<PriceDisplay price={1000} size="xl" />);
        expect(screen.getByText(/1/)).toHaveClass('text-2xl');
    });
});
