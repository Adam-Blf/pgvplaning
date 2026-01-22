import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title and branding
    await expect(page.locator('text=Absencia')).toBeVisible();
    await expect(page.locator('text=Bon retour !')).toBeVisible();

    // Check login/signup toggle exists
    await expect(page.locator('button:has-text("Connexion")')).toBeVisible();
    await expect(page.locator('button:has-text("Inscription")')).toBeVisible();

    // Check form fields
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Se connecter")')).toBeVisible();
  });

  test('should toggle between login and signup modes', async ({ page }) => {
    // Initially on login mode
    await expect(page.locator('text=Bon retour !')).toBeVisible();

    // Click signup button
    await page.click('button:has-text("Inscription")');

    // Should show signup form
    await expect(page.locator('text=Creer un compte')).toBeVisible();

    // Should show additional fields in signup mode
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#birthDate')).toBeVisible();

    // Toggle back to login
    await page.click('button:has-text("Connexion")');
    await expect(page.locator('text=Bon retour !')).toBeVisible();

    // Additional fields should be hidden
    await expect(page.locator('#firstName')).not.toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.fill('#email', 'invalid-email');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission or show error
    // Check that the form is still visible (not redirected)
    await expect(page.locator('#email')).toBeVisible();
  });

  test('should show password visibility toggle', async ({ page }) => {
    const passwordInput = page.locator('#password');

    // Initially password is hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button (the eye icon)
    await page.click('button[aria-label="Afficher le mot de passe"]');

    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide
    await page.click('button[aria-label="Masquer le mot de passe"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should show animated characters (password guardians)', async ({ page }) => {
    // Check that the animated SVG characters are present
    const guardians = page.locator('svg:has(circle[fill="#FCD34D"])');
    await expect(guardians).toHaveCount(3);
  });

  test('should have back to home link', async ({ page }) => {
    const backLink = page.locator('a:has-text("Retour")');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });

  test('should show required field validation', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Form should not submit, email field should be focused or show validation
    await expect(page.locator('#email')).toBeFocused();
  });

  test('should handle signup form validation', async ({ page }) => {
    // Switch to signup mode
    await page.click('button:has-text("Inscription")');

    // Fill only email and password
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // First name should be required
    await expect(page.locator('#firstName')).toBeFocused();
  });

  test('mobile: should display responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Mobile logo should be visible
    await expect(page.locator('text=Absencia')).toBeVisible();

    // Form should be centered and visible
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});
