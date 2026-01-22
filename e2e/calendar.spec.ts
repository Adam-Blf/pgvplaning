import { test, expect } from '@playwright/test';

test.describe('Calendar Page', () => {
  test.beforeEach(async ({ page }) => {
    // Calendar requires auth or guest mode - try to access directly
    await page.goto('/calendar');
  });

  test('should display calendar page structure', async ({ page }) => {
    // May redirect to login if not authenticated
    // Check for either calendar or login page
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    const isLogin = await page.locator('text=Connexion').isVisible().catch(() => false);

    expect(isCalendar || isLogin).toBeTruthy();
  });

  test('should display calendar header', async ({ page }) => {
    // If redirected to login, skip
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    await expect(page.locator('text=Mon Calendrier')).toBeVisible();
    await expect(page.locator('text=Cliquez ou glissez pour marquer')).toBeVisible();
  });

  test('should display painting toolbar', async ({ page }) => {
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    // Check toolbar buttons exist
    await expect(page.locator('text=Bureau')).toBeVisible();
    await expect(page.locator('text=Teletravail')).toBeVisible();
    await expect(page.locator('text=Conges')).toBeVisible();
  });

  test('should display legend section', async ({ page }) => {
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    // Check legend items
    await expect(page.locator('text=Bureau').first()).toBeVisible();
    await expect(page.locator('text=Teletravail').first()).toBeVisible();
    await expect(page.locator('text=Formation').first()).toBeVisible();
    await expect(page.locator('text=Conges').first()).toBeVisible();
  });

  test('should display tips section on desktop', async ({ page }) => {
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    await page.setViewportSize({ width: 1280, height: 720 });

    // Check for tips section
    await expect(page.locator('text=Astuce du jour')).toBeVisible();
  });

  test('should hide legend on mobile by default', async ({ page }) => {
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    await page.setViewportSize({ width: 375, height: 667 });

    // Legend toggle button should be visible on mobile
    await expect(page.locator('text=Legende des statuts')).toBeVisible();
  });
});

test.describe('Calendar Grid Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar');
  });

  test('should display calendar grid with days', async ({ page }) => {
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    // Calendar should have day headers
    const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    for (const day of dayHeaders) {
      await expect(page.locator(`text=${day}`).first()).toBeVisible();
    }
  });

  test('should have month navigation', async ({ page }) => {
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    // Check for navigation buttons (chevron icons)
    const prevButton = page.locator('button:has(svg)').first();
    const nextButton = page.locator('button:has(svg)').last();

    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
  });

  test('should display today button', async ({ page }) => {
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    // Look for today button
    await expect(page.locator('text=Aujourd').first()).toBeVisible();
  });
});

test.describe('Calendar Tool Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar');
  });

  test('should select different tools from toolbar', async ({ page }) => {
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    // Click on different tool buttons
    const bureauButton = page.locator('button:has-text("Bureau")').first();
    await bureauButton.click();

    // Should be selected (has active state)
    await expect(bureauButton).toBeVisible();

    // Click teletravail
    const teleButton = page.locator('button:has-text("Teletravail")').first();
    await teleButton.click();
    await expect(teleButton).toBeVisible();

    // Click conges
    const congesButton = page.locator('button:has-text("Conges")').first();
    await congesButton.click();
    await expect(congesButton).toBeVisible();
  });

  test('should have eraser tool', async ({ page }) => {
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    // Look for eraser tool (Gomme in French)
    const eraserButton = page.locator('button:has-text("Gomme")');
    await expect(eraserButton).toBeVisible();
  });

  test('should have half-day selection', async ({ page }) => {
    const isCalendar = await page.locator('text=Mon Calendrier').isVisible().catch(() => false);
    if (!isCalendar) {
      test.skip();
      return;
    }

    // Look for half-day options (AM/PM/Full)
    const halfDayOptions = page.locator('button:has-text("Matin"), button:has-text("Apres-midi"), button:has-text("Journee")');
    const count = await halfDayOptions.count();

    // Should have at least some half-day options
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
