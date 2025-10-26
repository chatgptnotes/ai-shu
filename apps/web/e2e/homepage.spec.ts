/**
 * E2E Test: Homepage
 * Tests basic homepage functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/AI-Shu/i);

    // Check main heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');

    // Click sign up button
    const signupLink = page.getByRole('link', { name: /sign up|get started/i });
    await signupLink.click();

    // Should be on signup page
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Click login button
    const loginLink = page.getByRole('link', { name: /log in|sign in/i });
    await loginLink.click();

    // Should be on login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/');

    // Click pricing link
    const pricingLink = page.getByRole('link', { name: /pricing/i });
    if (await pricingLink.isVisible()) {
      await pricingLink.click();

      // Should be on pricing page
      await expect(page).toHaveURL(/\/pricing/);
    }
  });
});
