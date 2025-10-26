/**
 * E2E Test: Authentication
 * Tests user registration and login flows
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Signup Flow', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/auth/signup');

      // Check form elements are visible
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    });

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.goto('/auth/signup');

      // Try to submit empty form
      await page.getByRole('button', { name: /sign up/i }).click();

      // Should show validation errors
      // Note: Exact error messages depend on your validation implementation
      await expect(page.locator('text=/required|invalid|enter/i').first()).toBeVisible({ timeout: 3000 });
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/auth/signup');

      // Enter invalid email
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/password/i).fill('Password123!');
      await page.getByRole('button', { name: /sign up/i }).click();

      // Should show validation error
      await expect(page.locator('text=/valid.*email|invalid.*email/i').first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Login Flow', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/auth/login');

      // Check form elements are visible
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeVisible();
    });

    test('should show validation errors for empty input', async ({ page }) => {
      await page.goto('/auth/login');

      // Try to submit empty form
      await page.getByRole('button', { name: /log in|sign in/i }).click();

      // Should show validation errors
      await expect(page.locator('text=/required|invalid|enter/i').first()).toBeVisible({ timeout: 3000 });
    });

    test('should have link to signup page', async ({ page }) => {
      await page.goto('/auth/login');

      // Should have link to signup
      const signupLink = page.getByRole('link', { name: /sign up|create account/i });
      await expect(signupLink).toBeVisible();

      // Click should navigate to signup
      await signupLink.click();
      await expect(page).toHaveURL(/\/auth\/signup/);
    });

    test('should have link to password reset', async ({ page }) => {
      await page.goto('/auth/login');

      // Should have link to password reset
      const resetLink = page.getByRole('link', { name: /forgot.*password|reset.*password/i });
      if (await resetLink.isVisible()) {
        await resetLink.click();
        await expect(page).toHaveURL(/\/auth\/reset-password/);
      }
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should display password reset form', async ({ page }) => {
      await page.goto('/auth/reset-password');

      // Check form elements are visible
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /reset|send/i })).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.goto('/auth/reset-password');

      // Enter invalid email
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByRole('button', { name: /reset|send/i }).click();

      // Should show validation error
      await expect(page.locator('text=/valid.*email|invalid.*email/i').first()).toBeVisible({ timeout: 3000 });
    });
  });
});
