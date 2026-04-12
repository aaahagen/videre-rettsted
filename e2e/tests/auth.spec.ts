import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('successful admin login redirects to dashboard', async ({ page }) => {
    page.on('console', msg => console.log(`Browser log: ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => console.log(`Browser error: ${error.message}`));

    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Check the actual button element directly with force
    const privacyCheckbox = page.locator('button[id="privacy"]');
    await privacyCheckbox.click({ force: true });
    
    // Wait to see if it actually got checked
    await expect(privacyCheckbox).toHaveAttribute('aria-checked', 'true');

    console.log("Clicking submit");
    await page.click('button[type="submit"]', { force: true });

    // Verify we landed on the dashboard
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 10000 });
  });
});
