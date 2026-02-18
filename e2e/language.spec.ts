import { test, expect } from '@playwright/test';

test.describe('Language Switcher', () => {
    test.beforeEach(async ({ page }) => {
        // Inject cookie consent
        await page.addInitScript(() => {
            localStorage.setItem(
                "kaarplus_cookie_consent",
                JSON.stringify({
                    version: "1.0",
                    consent: { essential: true, analytics: true, marketing: true },
                    timestamp: new Date().toISOString(),
                })
            );
        });
    });

    test('should switch languages and persist preference', async ({ page }) => {
        await page.goto('/');

        // Default language (Estonian)
        // Check for "Uusimad kuulutused" or similar
        // Let's assume homepage has some text "Uusimad" or "Otsi"
        // Or check header menu
        // "Kuulutused"

        await expect(page.getByRole('link', { name: 'Kuulutused', exact: true }).first()).toBeVisible();

        // Open language menu
        const langToggle = page.getByTestId('language-switcher').first();
        await langToggle.click();

        // Select English
        // The menu item contains the flag and text "English"
        await page.getByRole('menuitem').filter({ hasText: 'English' }).click();

        // Verify URL might allow locale? No, i18next uses localStorage and reload usually or component re-render.
        // Check text changed to "Listings" or "Ads"
        // "common:nav.listings" -> "Listings" (en)
        await expect(page.getByRole('link', { name: 'Listings', exact: true }).first()).toBeVisible();
        await expect(page.getByText('EN').first()).toBeVisible();

        // Reload and verify persistence
        await page.reload();
        await expect(page.getByRole('link', { name: 'Listings', exact: true }).first()).toBeVisible();
    });
});
