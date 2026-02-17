import { describe, it, expect } from 'vitest';
import { formatPrice, cn, formatNumber } from './utils';

describe('utils', () => {
	describe('formatPrice', () => {
		it('should format price correctly', () => {
			// Because Intl might depend on system locale, we generally mock it or expect consistent output
			// But here we can check if it contains the number and currency symbol if possible,
			// or just check the structure if we trust Intl not to change.
			// However, the function hardcodes 'et-EE' and 'EUR'.
			// "10 000 € (km-ga)" is expected for 10000
			const result = formatPrice(10000);
			expect(result).toContain('10');
			expect(result).toContain('000');
			expect(result).toContain('€');
			expect(result).toContain('(km-ga)');
		});

		it('should handle Vat exclusion', () => {
			const result = formatPrice(10000, false);
			expect(result).toContain('(km-ta)');
		});

		it('should format 0 correctly', () => {
			const result = formatPrice(0);
			expect(result).toContain('0');
			expect(result).toContain('€');
		});
	});

	describe('formatNumber', () => {
		it('should format large numbers', () => {
			const result = formatNumber(10000);
			// et-EE usually uses space or non-breaking space as group separator
			expect(result).toMatch(/10\s?000/);
		});
	});

	describe('cn', () => {
		it('should merge classes', () => {
			expect(cn('a', 'b')).toBe('a b');
		});

		it('should handle conditionals', () => {
			expect(cn('a', false && 'b', 'c')).toBe('a c');
		});

		it('should handle conflicts', () => {
			expect(cn('px-2', 'px-4')).toBe('px-4');
		});
	});
});
