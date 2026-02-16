import { test, expect } from '@playwright/test';

// Generate unique user for each run
const randomId = Math.random().toString(36).substring(7);
const userEmail = `seller-${randomId}@example.com`;
const userPassword = 'Password123!';
const userName = `Seller ${randomId}`;

test.describe.configure({ mode: 'serial' });

test.describe('Seller Flow', () => {
    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        await page.goto('/register');
        await page.fill('input[name="name"]', userName);
        await page.fill('input[name="email"]', userEmail);
        await page.fill('input[name="password"]', userPassword);
        await page.fill('input[name="confirmPassword"]', userPassword);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/dashboard/);
        await page.close();
    });

    test('should be able to create a new listing with mocked image upload', async ({ page }) => {
        // Mock S3 Presign
        await page.route('**/api/uploads/presign', async route => {
            const json = {
                uploadUrl: 'http://localhost:3000/fake-s3-upload',
                publicUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c698d9?q=80&w=2952&auto=format&fit=crop' // valid Next/Image src
            };
            await route.fulfill({ json });
        });

        // Mock S3 Upload (PUT)
        await page.route('**/fake-s3-upload', async route => {
            await route.fulfill({ status: 200 });
        });

        // Login
        await page.goto('/login');
        await page.fill('input[name="email"]', userEmail);
        await page.fill('input[name="password"]', userPassword);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/dashboard/);

        // Increase timeout for form filling
        test.setTimeout(60000);

        // Navigate to Sell
        await page.goto('/sell');

        // STEP 1: Vehicle Type
        await expect(page.getByText('Valige sõiduki tüüp')).toBeVisible();
        await page.click('text=Sedaan');
        await page.getByRole('button', { name: 'Edasi' }).click();

        // STEP 2: Basic Data
        await expect(page.getByText('Põhiandmed')).toBeVisible();

        // Helpers
        const selectOption = async (placeholder: string, option: string) => {
            // Find trigger by placeholder text and click
            await page.click(`text=${placeholder}`);
            // Wait for option to be visible and click
            await page.getByRole('option', { name: option }).click();
        };

        await selectOption('Valige mark', 'Audi');
        await page.fill('input[name="model"]', 'A6');
        await page.fill('input[name="year"]', '2023');
        await page.fill('input[name="price"]', '35000');
        await page.fill('input[name="mileage"]', '15000');
        await page.fill('input[name="location"]', 'Tallinn');

        await selectOption('Valige kütus', 'Diisel');
        await selectOption('Valige käigukast', 'Automaat');
        await page.fill('input[name="powerKw"]', '150');
        await selectOption('Valige vedu', 'Nelivedu (AWD)');

        // Select by locator for "Uksed" (4) and "Istekohad" (5)
        // Since placeholders are "Arv", we need context.
        // Assuming order: Doors is first "Arv", Seats is second.

        const triggers = page.getByText('Arv');
        await triggers.nth(0).click(); // Doors
        await page.getByRole('option', { name: '4' }).click();

        // Wait for dropdown to close
        await expect(page.getByRole('option', { name: '4' })).not.toBeVisible();

        await triggers.nth(1).click(); // Seats
        await page.getByRole('option', { name: '5' }).click();
        await expect(page.getByRole('option', { name: '5' })).not.toBeVisible();

        await page.fill('input[name="colorExterior"]', 'Must');
        await selectOption('Valige seisukord', 'Kasutatud');

        await page.getByRole('button', { name: 'Edasi' }).click();

        // STEP 3: Photos
        await expect(page.getByText('Lisage fotod')).toBeVisible();

        // Upload 3 fake images
        await page.setInputFiles('input[type="file"]', [
            { name: 'car1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake image') },
            { name: 'car2.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake image 2') },
            { name: 'car3.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake image 3') }
        ]);

        // Wait for 3 images to be visible in preview
        await expect(page.locator('.group.relative.aspect-video')).toHaveCount(3);

        await page.getByRole('button', { name: 'Avalda kuulutus' }).click();

        // Verification
        // Should show Step 4 Confirmation
        // "Kuulutus on edukalt salvestatud!" or similar text from step-4-confirmation.tsx
        // Let's verify text "Ootel kinnitust" or "Teie kuulutus on edukalt lisatud"
        // Verification
        await expect(page.getByText('Kuulutus on edukalt esitatud!')).toBeVisible();

        // Check "on nüüd ülevaatusel"
        await expect(page.getByText('on nüüd ülevaatusel')).toBeVisible();
    });
});
