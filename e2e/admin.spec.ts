import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
    test('should view pending listings and approve one', async ({ page }) => {
        // Mock API response for pending listings
        await page.route('**/api/admin/listings/pending', async route => {
            const json = {
                data: [
                    {
                        id: 'listing-mock-1',
                        make: 'Mock',
                        model: 'Car',
                        year: 2024,
                        price: 15000,
                        mileage: 5000,
                        status: 'PENDING',
                        user: { name: 'Test Seller' },
                        createdAt: new Date().toISOString(),
                        images: [{ url: 'https://images.unsplash.com/photo-1583121274602-3e2820c698d9' }]
                    }
                ]
            };
            await route.fulfill({ json });
        });

        // Mock Approval API
        await page.route('**/api/admin/listings/listing-mock-1/verify', async route => {
            // Verify that body contains action: 'approve'
            const body = route.request().postDataJSON();
            if (body.action === 'approve') {
                await route.fulfill({ status: 200, json: { success: true } });
            } else {
                await route.fulfill({ status: 400 });
            }
        });

        // Login as Admin
        // Optimization: Use session storage if possible, but form fill is fast enough
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@kaarplus.ee');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Should redirect to /admin or check if we need to navigate there
        // The earlier bug fix redirects admins to /admin.
        await expect(page).toHaveURL(/admin/);

        // Go to listings page specifically to be safe
        await page.goto('/admin/listings');

        // Check for the mock listing
        await expect(page.getByText('Mock Car', { exact: false })).toBeVisible();

        // Find Approve button. 
        // Need to check ListingReviewCard structure or use generic "Kinnita" or "Approve" text.
        // Assuming there is a button with "Kinnita"
        await page.getByRole('button', { name: 'Kinnita' }).click();

        // Success toast "Kinnitatud"
        await expect(page.getByText('Kinnitatud')).toBeVisible();
        await expect(page.getByText('Kuulutus on nüüd avalikult nähtav.')).toBeVisible();

        // Listing should disappear
        await expect(page.getByText('Mock Car')).not.toBeVisible();
    });
});
