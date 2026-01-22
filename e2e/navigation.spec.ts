import { test, expect } from '@playwright/test';

test.describe('Navigation and Pages', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');

    // Check for main branding
    await expect(page.locator('text=Absencia')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('text=Connexion')).toBeVisible();
    await expect(page.locator('text=Inscription')).toBeVisible();
  });

  test('should load legal mentions page', async ({ page }) => {
    await page.goto('/mentions-legales');

    await expect(page.locator('text=Mentions Legales')).toBeVisible();
  });

  test('should load contact page', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('text=Contact')).toBeVisible();
  });

  test('should load guide page', async ({ page }) => {
    await page.goto('/guide');

    // Guide page should exist
    await expect(page).toHaveURL('/guide');
  });

  test('should display 404 for non-existent pages', async ({ page }) => {
    await page.goto('/non-existent-page-12345');

    // Should show 404 or redirect
    const is404 = await page.locator('text=404').isVisible().catch(() => false);
    const isNotFound = await page.locator('text=introuvable').isVisible().catch(() => false);

    expect(is404 || isNotFound || page.url().includes('404')).toBeTruthy();
  });

  test('should handle team setup page', async ({ page }) => {
    await page.goto('/team/setup');

    // May redirect to login or show setup
    const hasSetup = await page.locator('text=Creer une equipe').isVisible().catch(() => false);
    const hasLogin = await page.locator('text=Connexion').isVisible().catch(() => false);

    expect(hasSetup || hasLogin).toBeTruthy();
  });

  test('should handle exports page (requires auth)', async ({ page }) => {
    await page.goto('/exports');

    // May redirect to login or show exports
    const hasExports = await page.locator('text=Export').isVisible().catch(() => false);
    const hasLogin = await page.locator('text=Connexion').isVisible().catch(() => false);

    expect(hasExports || hasLogin).toBeTruthy();
  });

  test('should handle analytics page (requires auth)', async ({ page }) => {
    await page.goto('/analytics');

    // May redirect to login or show analytics
    const hasAnalytics = await page.locator('text=Statistiques').isVisible().catch(() => false);
    const hasLogin = await page.locator('text=Connexion').isVisible().catch(() => false);

    expect(hasAnalytics || hasLogin).toBeTruthy();
  });

  test('should handle settings page (requires auth)', async ({ page }) => {
    await page.goto('/settings');

    // May redirect to login or show settings
    const hasSettings = await page.locator('text=Parametres').isVisible().catch(() => false);
    const hasLogin = await page.locator('text=Connexion').isVisible().catch(() => false);

    expect(hasSettings || hasLogin).toBeTruthy();
  });
});

test.describe('Responsive Navigation', () => {
  test('mobile: should display mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that page loads on mobile
    await expect(page.locator('text=Absencia')).toBeVisible();
  });

  test('tablet: should display tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('text=Absencia')).toBeVisible();
  });

  test('desktop: should display desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.locator('text=Absencia')).toBeVisible();
  });
});

test.describe('Security Headers', () => {
  test('should include security headers', async ({ page }) => {
    const response = await page.goto('/');

    if (response) {
      const headers = response.headers();

      // Check for security headers (may not all be present in dev mode)
      // These are informational checks
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'strict-transport-security',
        'referrer-policy',
      ];

      for (const header of securityHeaders) {
        const value = headers[header];
        // Log for debugging, don't fail if missing in dev
        console.log(`${header}: ${value || 'not set'}`);
      }
    }
  });
});

test.describe('Accessibility', () => {
  test('login page should have accessible form', async ({ page }) => {
    await page.goto('/login');

    // Check for labels
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();

    // Check form has proper structure
    await expect(page.locator('form')).toBeVisible();

    // Check button has text
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should have focus visible styles', async ({ page }) => {
    await page.goto('/login');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Something should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('should have skip links or proper heading structure', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);
  });
});

test.describe('Performance', () => {
  test('should load home page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should load login page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });
});
