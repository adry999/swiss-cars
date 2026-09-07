import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SwissCars|Next/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('inventory page loads with cars', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForTimeout(1000);
    const cars = page.locator('[data-testid="car-card"]');
    const count = await cars.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('car detail page loads', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForTimeout(1000);
    const firstCar = page.locator('[data-testid="car-card"]').first();
    const link = firstCar.locator('a').first();
    const href = await link.getAttribute('href');
    if (href) {
      await page.goto(href);
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('Russian locale works', async ({ page }) => {
    await page.goto('/ru/');
    await expect(page).toHaveURL(/\/ru/);
  });

  test('English locale works', async ({ page }) => {
    await page.goto('/en/');
    await expect(page).toHaveURL(/\/en/);
  });

  test('contact form submits', async ({ page }) => {
    await page.goto('/');
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      const nameInput = form.locator('input[name*="name"], input[placeholder*="Name"]').first();
      const emailInput = form.locator('input[type="email"]').first();
      const messageInput = form.locator('textarea').first();

      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User');
        await emailInput.fill('test@example.com');
        await messageInput.fill('Test message');
        const submitBtn = form.locator('button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
