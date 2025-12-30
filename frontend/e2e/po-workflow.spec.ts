import { test, expect } from '@playwright/test';

test.describe('Purchase Order Workflow', () => {
    test('should view PO list and click on a PO detail', async ({ page }) => {
        await page.goto('/po');
        await page.waitForLoadState('networkidle');

        // Check if we have the right page title
        await expect(page.getByRole('heading', { name: /PURCHASE ORDERS/i }).first()).toBeVisible();

        // Find the first PO link in the table
        // The table is rendered by PageTemplate -> DataTable
        const firstPOLink = page.locator('table tbody tr td a').first();
        await expect(firstPOLink).toBeVisible({ timeout: 15000 });

        const poNumber = (await firstPOLink.textContent())?.trim();
        await firstPOLink.click();

        // Verify detail page
        await expect(page).toHaveURL(new RegExp(`/po/${encodeURIComponent(poNumber!)}`));

        // Detail page heading "PO #6644164"
        await expect(page.getByRole('heading', { name: new RegExp(`PO #?${poNumber}`, 'i') })).toBeVisible();
    });

    test('should navigate to Create PO page', async ({ page }) => {
        await page.goto('/po');
        await page.waitForLoadState('networkidle');

        // Click "New PO" button
        const createBtn = page.getByRole('button', { name: /New PO/i });
        await createBtn.click();

        await expect(page).toHaveURL(/\/po\/create$/);
        await expect(page.getByRole('heading', { name: /Create Purchase Order/i }).first()).toBeVisible();
    });
});
