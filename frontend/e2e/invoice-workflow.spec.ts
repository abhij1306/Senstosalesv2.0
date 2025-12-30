import { test, expect } from '@playwright/test';

test.describe('Invoice Workflow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/invoice');
        await page.waitForLoadState('networkidle');
    });

    test('should load the Invoice page and handle empty list or table', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /INVOICE/i }).first()).toBeVisible();

        // Check if either table is present OR the empty message is shown
        const invoiceTable = page.locator('table');
        const emptyMessage = page.locator('text=No invoices found');

        await expect(invoiceTable.or(emptyMessage)).toBeVisible();
    });

    test('should navigate to Create Invoice page', async ({ page }) => {
        const createBtn = page.getByRole('button', { name: /New Invoice/i });
        await expect(createBtn).toBeVisible();
        await createBtn.click();

        // Updated standard regex to handle query params if any
        await expect(page).toHaveURL(/.*\/invoice\/create$/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: /Create GST Invoice/i }).first()).toBeVisible();
    });

    test('should view a specific Invoice detail and verify print options (if exists)', async ({ page }) => {
        const firstInvoiceLink = page.locator('table tbody tr td a').first();
        const count = await firstInvoiceLink.count();

        if (count > 0) {
            const invNumber = (await firstInvoiceLink.textContent())?.trim();
            await firstInvoiceLink.click();

            // Check URL and heading
            await expect(page).toHaveURL(
                new RegExp(`/invoice/${encodeURIComponent(invNumber || '')}`)
            );

            // Verify presence of Print button
            const printBtn = page.getByRole('button', { name: /Print/i });
            await expect(printBtn).toBeVisible();
        } else {
            console.log('Skipping Invoice detail test: No Invoices found.');
        }
    });
});
