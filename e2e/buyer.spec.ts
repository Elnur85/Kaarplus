import { test, expect } from '@playwright/test';

test.describe('Buyer Flow', () => {
    test('should search and view a listing', async ({ page }) => {
        await page.goto('/listings');

        // Wait for listings to load
        // Assuming ListingCard has some identifying class or structure
        // Let's assume there are headings inside cards
        await expect(page.locator('h3').first()).toBeVisible();

        // Filter by Make (if possible, skipping for simplicity to just verify browse)

        // Click on the first listing card's image or title
        // .block.group is usually the link wrapper in my component design
        // Or find any link that goes to /listings/[id]

        const firstListing = page.locator('a[href^="/listings/"]').first();
        await expect(firstListing).toBeVisible();
        await firstListing.click();

        // Verify detail page
        await expect(page).toHaveURL(/\/listings\//);

        // Verify key elements
        await expect(page.getByText('Tehnilised andmed')).toBeVisible();
        await expect(page.getByText('Kirjeldus')).toBeVisible();

        // Check contact button or form
        // "Küsi lisa" or "Saada sõnum"
        // Check for seller info
        await expect(page.getByText('Müüja info', { exact: false }).first()).toBeVisible();
    });
});
