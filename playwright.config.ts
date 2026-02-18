import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Read from default .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
    testDir: './e2e',
    timeout: 30 * 1000,
    expect: {
        timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        actionTimeout: 0,
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        locale: 'et-EE',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
    ],
    // Run your local dev server before starting the tests
    webServer: {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
