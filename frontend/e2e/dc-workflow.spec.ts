import { test, expect } from '@playwright/test';

test.describe('Delivery Challan Workflow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dc');
        await page.waitForLoadState('networkidle');
    });

    test('should load the DC page and handle empty list or table', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /DELIVERY CHALLANS/i }).first()).toBeVisible();

        // Check if either the table is present OR the empty message is shown
        const dcTable = page.locator('table');
        const emptyMessage = page.locator('text=No delivery challans found');

        // Use a custom locator to check for one or the other
        await expect(dcTable.or(emptyMessage)).toBeVisible();
    });

    test('should navigate to Create DC page from the list', async ({ page }) => {
        // Look for the button more aggressively
        const createBtn = page.getByRole('button', { name: /New DC/i });
        await expect(createBtn).toBeVisible();
        await createBtn.click();

        // Wait for URL change
        await expect(page).toHaveURL(/\/dc\/create$/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: /Create Delivery Challan/i }).first()).toBeVisible();
    });

    test('should view a specific DC detail (if exists)', async ({ page }) => {
        // This test will only run successfully if there is data
        // If not, we skip it or just verify the empty state
        const firstDCLink = page.locator('table tbody tr td a').first();
        const count = await firstDCLink.count();

        if (count > 0) {
            const dcNumber = (await firstDCLink.textContent())?.trim();
            await firstDCLink.click();
            await expect(page).toHaveURL(new RegExp(`/dc/${encodeURIComponent(dcNumber!)}`));

            await expect(page.getByRole('heading', { name: new RegExp(`DC #?${dcNumber}`, 'i') })).toBeVisible();
        } else {
            console.log('Skipping DC detail test: No DCs found in the system.');
        }
    });
});
