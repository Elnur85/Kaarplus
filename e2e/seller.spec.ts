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

    test.beforeEach(async ({ page }) => {
        // Inject cookie consent to avoid banner intercepting clicks
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

    test('should be able to create a new listing with mocked image upload', async ({ page }) => {
        // Mock S3 upload endpoints to avoid dependency on external services/credentials
        await page.route('**/api/uploads/presign', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    uploadUrl: 'https://fake-s3-bucket.com/upload',
                    publicUrl: 'https://fake-s3-bucket.com/image.jpg'
                })
            });
        });

        await page.route('https://fake-s3-bucket.com/upload', async route => {
            await route.fulfill({ status: 200 });
        });

        await page.route('**/api/listings/*/images', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
        });

        // Mock Listing Creation
        await page.route('**/api/listings', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        data: { id: 'mock-listing-123' }
                    })
                });
            } else {
                await route.continue();
            }
        });

        // Increase timeout for complex flow
        test.setTimeout(180000);

        // Login
        await page.goto('/login');
        if (page.url().includes('/login')) {
            await page.fill('input[name="email"]', userEmail);
            await page.fill('input[name="password"]', userPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
        } else {
            // Already logged in? Check dashboard
            await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
        }

        // Navigate to Sell
        await page.goto('/sell');

        // STEP 1: Vehicle Type
        await expect(page.getByText('Valige sõiduki tüüp')).toBeVisible();
        await page.click('text=Sedaan');
        await page.getByRole('button', { name: 'Edasi' }).click();

        // STEP 2: Basic Data
        await expect(page.getByText('Põhiandmed')).toBeVisible();

        // Contact Info (newly added fields)
        await page.fill('input[name="contactName"]', userName);
        await page.fill('input[name="contactEmail"]', userEmail);
        await page.fill('input[name="contactPhone"]', '5555555');

        // Step 2 filling
        // Helper to find select trigger by associated label text
        const selectOptionByLabel = async (label: string, option: string) => {
            const labelLocator = page.locator('label').filter({ hasText: label }).first();
            await labelLocator.scrollIntoViewIfNeeded();

            const container = labelLocator.locator('xpath=..');
            const trigger = container.locator('button').first();

            await trigger.click();

            // Wait for the option to appear and click it
            // Shadcn/Radix select items have role="option"
            const optionLocator = page.getByRole('option', { name: option }).first();
            await optionLocator.waitFor({ state: 'visible', timeout: 5000 });
            await optionLocator.click();

            // Wait for the popover to close
            await page.waitForTimeout(300);
        };

        const fillAndBlur = async (id: string, value: string) => {
            const locator = page.locator(id);
            await locator.scrollIntoViewIfNeeded();
            await locator.click();
            await page.keyboard.press('Meta+A');
            await page.keyboard.press('Backspace');
            await page.keyboard.type(value, { delay: 10 });
            await page.keyboard.press('Tab');
            await page.waitForTimeout(100);
        };

        await selectOptionByLabel('Automark *', 'Audi');

        await fillAndBlur('#model', 'A6');
        await fillAndBlur('#year', '2023');
        await fillAndBlur('#price', '35000');
        await fillAndBlur('#mileage', '15000');
        await fillAndBlur('#location', 'Tallinn');

        await selectOptionByLabel('Kütus *', 'Diisel');
        await selectOptionByLabel('Käigukast *', 'Automaat');

        await fillAndBlur('#powerKw', '150');
        await selectOptionByLabel('Vedu *', 'Nelivedu (AWD)');

        await selectOptionByLabel('Uksed *', '4');
        await selectOptionByLabel('Istekohad *', '5');

        await fillAndBlur('#colorExterior', 'Must');
        await selectOptionByLabel('Seisukord *', 'Kasutatud');

        await page.getByRole('button', { name: 'Edasi' }).click();

        // Ensure we actually moved to Step 3
        const heading = page.getByRole('heading', { name: 'Lisage fotod' });
        await expect(heading).toBeVisible({ timeout: 20000 });

        // Upload 3 fake images
        await page.setInputFiles('input[type="file"]', [
            { name: 'car1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake image') },
            { name: 'car2.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake image 2') },
            { name: 'car3.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake image 3') }
        ]);

        // Wait for 3 images to be visible in preview
        await expect(page.locator('.group.relative.aspect-video')).toHaveCount(3, { timeout: 30000 });

        await page.getByRole('button', { name: 'Avalda kuulutus' }).click();

        // Verification
        await expect(page.getByText('Kuulutus on edukalt esitatud!')).toBeVisible({ timeout: 30000 });
        await expect(page.getByText('on nüüd ülevaatusel')).toBeVisible();
    });
});
