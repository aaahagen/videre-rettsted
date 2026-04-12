import { Page, expect } from '@playwright/test';

export async function login(page: Page, email: string, password = 'password123') {
  await page.goto('/login');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // The simplest, most direct way to click the Shadcn checkbox based on its unique ID
  await page.locator('button#privacy').click();

  await page.click('button[type="submit"]');

  // Add a small pause to let React render any errors if they happen, before failing the URL assertion
  await page.waitForTimeout(2000);

  // Take a screenshot to see what went wrong!
  await page.screenshot({ path: 'login-error-screenshot.png' });

  // Wait for navigation to the dashboard to confirm login
  await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 10000 });
}
