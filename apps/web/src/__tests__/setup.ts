import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
        get: vi.fn(),
        getAll: vi.fn(),
        has: vi.fn(),
        forEach: vi.fn(),
        entries: vi.fn(),
        keys: vi.fn(),
        values: vi.fn(),
        toString: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
    useSession: vi.fn(() => ({
        data: null,
        status: 'unauthenticated',
    })),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
}));

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
    useToast: vi.fn(() => ({
        toast: vi.fn(),
    })),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string, options?: any) => {
            if (options && typeof options === 'object') {
                if ('defaultValue' in options) return options.defaultValue;
                if ('returnObjects' in options) return [];
            }
            return key;
        },
        i18n: {
            changeLanguage: vi.fn(),
            language: 'et',
        },
    })),
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn(),
    },
}));

// Global fetch mock
global.fetch = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    root = null;
    rootMargin = '';
    thresholds = [];
    disconnect() { }
    observe() { }
    unobserve() { }
    takeRecords() { return []; }
} as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};

// Mock next/image
vi.mock('next/image', () => ({
    default: (props: any) => React.createElement('img', props),
}));
