import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        exclude: ['node_modules/', '**/dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/controllers/**', 'src/routes/**', 'src/middleware/**', 'src/services/**'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@kaarplus/database': path.resolve(__dirname, '../../packages/database/src'),
        },
    },
});
