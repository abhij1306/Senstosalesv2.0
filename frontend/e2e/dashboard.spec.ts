import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should load the dashboard and show stats', async ({ page }) => {
        await expect(page).toHaveTitle(/SenstoSales/i);
        await expect(page.locator('text=SENSTOSALES')).toBeVisible();
        await expect(page.getByRole('heading', { name: /DASHBOARD/i })).toBeVisible();

        // Verify presence of specific KPI cards using text contents
        await expect(page.locator('text=Invoiced Sales').first()).toBeVisible();
        await expect(page.locator('text=Purchase Commitment').first()).toBeVisible();
    });

    test('should navigate to PO list via Sidebar', async ({ page }) => {
        const poLink = page.getByRole('link', { name: /Purchase Order/i }).first();
        await poLink.click();
        await expect(page).toHaveURL(/\/po$/);
        await expect(page.getByRole('heading', { name: /PURCHASE ORDERS/i }).first()).toBeVisible();
    });

    test('should open command palette with Ctrl+K', async ({ page }) => {
        await page.keyboard.press('Control+k');
        const portal = page.locator('text=Type to search...');
        await expect(portal).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(portal).not.toBeVisible();
    });
});
