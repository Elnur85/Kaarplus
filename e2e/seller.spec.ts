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
            console.log(`Selecting '${option}' for '${label}'...`);

            // Safety click to close any open popovers
            await page.mouse.click(0, 0);
            await page.waitForTimeout(100);

            const labelLocator = page.locator('label').filter({ hasText: label }).first();
            await labelLocator.scrollIntoViewIfNeeded();

            // Use specific parent container (FormItem) instead of generic div search
            // This prevents finding the main wrapper div which contains the first button (Automark)
            const container = labelLocator.locator('xpath=..');
            const trigger = container.locator('button').first();

            // debug trigger
            const triggerHTML = await trigger.evaluate(el => el.outerHTML).catch(() => 'Trigger not found');
            console.log(`Trigger for ${label}:`, triggerHTML);

            await trigger.click({ force: true });
            await page.waitForTimeout(1000); // Increased wait

            // Verify if opened
            let isExpanded = await trigger.getAttribute('aria-expanded');
            if (isExpanded === 'false') {
                console.log(`Dropdown for ${label} did not open. Retrying with Keyboard Space...`);
                await trigger.focus();
                await page.keyboard.press('Space');
                await page.waitForTimeout(1000);
            }

            // Use keyboard to select
            console.log(`Typing '${option}'...`);
            await page.keyboard.type(option);
            await page.waitForTimeout(500);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);

            // Verify selection stuck
            const updatedTriggerHTML = await trigger.evaluate(el => el.textContent);
            if (!updatedTriggerHTML?.includes(option)) {
                console.error(`Selection failed! Trigger text is '${updatedTriggerHTML}', expected '${option}'`);
            } else {
                console.log(`Selected '${option}' successfully.`);
            }
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

        try {
            await expect(heading).toBeVisible({ timeout: 20000 });
        } catch (e) {
            console.log('Step 3 title NOT visible. Checking for validation errors...');
            // Capture validation errors
            const alerts = await page.getByRole('alert').allTextContents();
            const destructive = await page.locator('.text-destructive').allTextContents();
            const errors = [...alerts, ...destructive];
            console.log('Validation Errors found:', errors);

            const bodyText = await page.textContent('body');
            console.log('Body Text (Snapshot):', bodyText?.substring(0, 1000));

            throw e;
        }

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
        try {
            await expect(page.getByText('Kuulutus on edukalt esitatud!')).toBeVisible({ timeout: 30000 });
            await expect(page.getByText('on nüüd ülevaatusel')).toBeVisible();
        } catch (e) {
            console.log('Submission failed. Checking for errors...');
            const alerts = await page.getByRole('alert').allTextContents();
            const destructive = await page.locator('.text-destructive').allTextContents();
            console.log('Submission Errors:', [...alerts, ...destructive]);
            const body = await page.textContent('body');
            console.log('Final Body:', body?.substring(0, 1000));
            throw e;
        }
    });
});
