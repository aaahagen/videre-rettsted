import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Login Flow', () => {

  test('successful admin login redirects to dashboard', async ({ page }) => {
    // Navigate and fill details manually to debug
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Explicitly wait for the checkbox to be visible and stable
    const checkbox = page.locator('button[role="checkbox"]').first();
    await expect(checkbox).toBeVisible();
    await checkbox.click({ force: true });

    // Wait to see if it actually got checked visually (aria-checked="true")
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');

    await page.click('button[type="submit"]');

    // Wait to see if any error message appears *before* we time out on the URL
    try {
      await expect(page.locator('.text-destructive').first()).toBeVisible({ timeout: 3000 });
      const errorText = await page.locator('.text-destructive').first().textContent();
      console.log('Found an error message on screen:', errorText);
    } catch (e) {
      console.log('No visible error messages found, waiting for redirect...');
    }

    // Verify we landed on the dashboard
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 10000 });
  });

});
