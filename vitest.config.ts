import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
        exclude: [
            'node_modules/',
            'e2e/**',
            '**/dist/**',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'test/',
                'e2e/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/dist/**',
                'apps/web/src/app/**/page.tsx',
                'apps/web/src/app/**/layout.tsx',
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './apps/web/src'),
            '@kaarplus/database': path.resolve(__dirname, './packages/database/src'),
        },
    },
});
