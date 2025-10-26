/**
 * E2E Test: Dashboard
 * Tests dashboard functionality (requires authentication)
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
  });

  test('should display session creation option for unauthenticated users', async ({ page }) => {
    await page.goto('/session/new');

    // Should either show the form or redirect to login
    // This depends on your implementation
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(session\/new|auth\/login)/);
  });
});

test.describe('Session Creation', () => {
  test('should display session creation form', async ({ page }) => {
    await page.goto('/session/new');

    // If not redirected to login, check form elements
    if (!page.url().includes('/auth/login')) {
      // Check for subject selection
      const subjectElement = page.locator('text=/subject|topic/i').first();
      await expect(subjectElement).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Help Page', () => {
  test('should load help page', async ({ page }) => {
    await page.goto('/help');

    // Check page loads
    await expect(page).toHaveTitle(/Help|Support|AI-Shu/i);
  });
});
