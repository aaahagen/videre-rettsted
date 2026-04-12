import { test, expect } from '@playwright/test';

test('has expected title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Videre/i);
});
