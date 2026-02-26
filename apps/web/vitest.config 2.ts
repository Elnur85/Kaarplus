import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.ts'],
        css: false,
        include: ['src/**/*.test.{ts,tsx}'],
        exclude: ['node_modules/', 'e2e/**', '**/dist/**'],
    },
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
