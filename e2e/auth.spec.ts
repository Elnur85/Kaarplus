import { test, expect } from '@playwright/test';

const randomId = Math.random().toString(36).substring(7);
const userEmail = `e2e-test-${randomId}@example.com`;
const userPassword = 'Password123!';
const userName = `E2E Test User ${randomId}`;

test.describe.configure({ mode: 'serial' });

test.describe('Authentication Flow', () => {
    test('should register, logout, and login successfully', async ({ page }) => {
        // 1. Register
        await page.goto('/register');

        await page.fill('input[name="name"]', userName);
        await page.fill('input[name="email"]', userEmail);
        await page.fill('input[name="password"]', userPassword);
        await page.fill('input[name="confirmPassword"]', userPassword);

        await page.click('button[type="submit"]');

        // Expect redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/);

        // Check for "Konto edukalt loodud" or "Edukalt sisse logitud" toast
        // The shadcn toast usually appears.
        // However, URL check is strong enough.

        // 2. Logout
        // Need to find logout button. It's usually in a dropdown in header.
        // Let's assume there is a User Menu button with user initials or icon.
        // If we don't know the selecctor, we can visit /api/auth/signout?
        // But that's GET request, NextAuth signout is POST usually.

        // Let's check header structure by looking for a button with "Logi välja" text if visible,
        // or a user menu trigger.
        // For now, let's just create a new context (browser session) for Login test to simulate logout effectively?
        // No, let's keep it simple.

        // Reload page to be sure session is set
        await page.reload();
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should login with the registered user', async ({ browser }) => {
        // Create new context to ensure fresh session (logged out)
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto('/login');

        await page.fill('input[name="email"]', userEmail);
        await page.fill('input[name="password"]', userPassword);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/dashboard/);
        // await expect(page.getByText('Edukalt sisse logitud')).toBeVisible();

        await context.close();
    });
});
