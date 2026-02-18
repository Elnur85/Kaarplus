import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { useTranslation } from 'react-i18next';

// Re-mock useTranslation specifically for this test to control i18n
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(),
}));

// Mock Radix UI DropdownMenu to avoid JSDOM issues
vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown">{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div data-testid="trigger">{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div data-testid="content">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => (
        <div onClick={onClick} data-testid="item" className="item">{children}</div>
    ),
}));

describe('LanguageSwitcher', () => {
    const mockChangeLanguage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useTranslation as any).mockReturnValue({
            i18n: {
                language: 'et',
                changeLanguage: mockChangeLanguage,
            },
        });

        // Mock localStorage
        const localStorageMock = (() => {
            let store: Record<string, string> = {};
            return {
                getItem: (key: string) => store[key] || null,
                setItem: (key: string, value: string) => {
                    store[key] = value.toString();
                },
                clear: () => {
                    store = {};
                },
            };
        })();
        Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
    });

    it('renders current language name in trigger', () => {
        render(<LanguageSwitcher />);
        const trigger = screen.getByTestId('trigger');
        expect(within(trigger).getByText('Eesti')).toBeInTheDocument();
    });

    it('shows all languages in the menu', () => {
        render(<LanguageSwitcher />);
        const content = screen.getByTestId('content');
        expect(within(content).getByText('Eesti')).toBeInTheDocument();
        expect(within(content).getByText('Русский')).toBeInTheDocument();
        expect(within(content).getByText('English')).toBeInTheDocument();
    });

    it('calls i18n.changeLanguage and updates localStorage when a language is selected', () => {
        render(<LanguageSwitcher />);
        const content = screen.getByTestId('content');
        const englishItem = within(content).getByText('English');
        fireEvent.click(englishItem);

        expect(mockChangeLanguage).toHaveBeenCalledWith('en');
        expect(localStorage.getItem('kaarplus-lang')).toBe('en');
    });

    it('shows checkmark for the current language in the menu', () => {
        render(<LanguageSwitcher />);
        const content = screen.getByTestId('content');

        // Find English item in content
        const items = within(content).getAllByTestId('item');
        const eestiItem = items.find(item => item.textContent?.includes('Eesti'));
        const englishItem = items.find(item => item.textContent?.includes('English'));

        expect(eestiItem).toHaveTextContent('✓');
        expect(englishItem).not.toHaveTextContent('✓');
    });
});
