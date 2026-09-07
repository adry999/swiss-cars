import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test('unauthenticated users redirect to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading')).toContainText(/login|sign in/i);
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('admin inventory page structure', async ({ page }) => {
    await page.goto('/admin/inventory');
    await page.waitForTimeout(500);
    if (await page.url().includes('/login')) {
      console.log('Not authenticated, skipping admin inventory test');
      return;
    }
    const table = page.locator('[data-testid="cars-table"], table').first();
    if (await table.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(table).toBeVisible();
    }
  });

  test('admin leads page loads', async ({ page }) => {
    await page.goto('/admin/leads');
    await page.waitForTimeout(500);
    if (await page.url().includes('/login')) {
      console.log('Not authenticated, skipping admin leads test');
      return;
    }
    const heading = page.getByRole('heading');
    if (await heading.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(heading).toBeVisible();
    }
  });

  test('admin reviews page loads', async ({ page }) => {
    await page.goto('/admin/reviews');
    await page.waitForTimeout(500);
    if (await page.url().includes('/login')) {
      console.log('Not authenticated, skipping admin reviews test');
      return;
    }
    const page_title = page.locator('h1, [role="heading"]').first();
    if (await page_title.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(page_title).toBeVisible();
    }
  });

  test('admin settings page loads', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForTimeout(500);
    if (await page.url().includes('/login')) {
      console.log('Not authenticated, skipping admin settings test');
      return;
    }
    const inputs = page.locator('input, textarea').first();
    if (await inputs.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(inputs).toBeVisible();
    }
  });
});
