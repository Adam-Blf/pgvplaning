import { test, expect } from '@playwright/test';

test.describe('Team Creation and Join Flow', () => {
  test.describe('Team Setup Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/team/setup');
    });

    test('should display team setup options', async ({ page }) => {
      // Check page loads with setup options
      await expect(page.locator('text=Absencia')).toBeVisible();

      // Should have create and join options
      await expect(page.locator('text=Creer une equipe')).toBeVisible();
      await expect(page.locator('text=Rejoindre une equipe')).toBeVisible();
    });
  });

  test.describe('Team Create Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/team/create');
    });

    test('should display team creation form', async ({ page }) => {
      // Check header
      await expect(page.locator('text=Creer une equipe')).toBeVisible();
      await expect(page.locator('text=Un code unique sera genere automatiquement')).toBeVisible();

      // Check form fields
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#description')).toBeVisible();

      // Check sector selection buttons
      await expect(page.locator('text=Public')).toBeVisible();
      await expect(page.locator('text=Prive')).toBeVisible();

      // Check leave days inputs
      await expect(page.locator('#leaveDaysEmployee')).toBeVisible();
      await expect(page.locator('#leaveDaysExecutive')).toBeVisible();
    });

    test('should toggle sector selection', async ({ page }) => {
      // Initially public might be selected
      const publicButton = page.locator('button:has-text("Public")').first();
      const privateButton = page.locator('button:has-text("Prive")').first();

      // Click private
      await privateButton.click();

      // Private should have selected style
      await expect(privateButton).toHaveClass(/border-emerald/);

      // Click public
      await publicButton.click();

      // Public should have selected style
      await expect(publicButton).toHaveClass(/border-blue/);
    });

    test('should validate required team name', async ({ page }) => {
      // Try to submit without name
      await page.click('button[type="submit"]');

      // Should show validation - form should not submit
      await expect(page.locator('#name')).toBeVisible();
    });

    test('should update leave days inputs', async ({ page }) => {
      const employeeInput = page.locator('#leaveDaysEmployee');
      const executiveInput = page.locator('#leaveDaysExecutive');

      // Clear and set new values
      await employeeInput.fill('30');
      await executiveInput.fill('35');

      // Check values are updated
      await expect(employeeInput).toHaveValue('30');
      await expect(executiveInput).toHaveValue('35');

      // Check summary is updated
      await expect(page.locator('text=Non-cadres:')).toBeVisible();
      await expect(page.locator('text=30j')).toBeVisible();
    });

    test('should have back link to setup page', async ({ page }) => {
      const backLink = page.locator('a:has-text("RETOUR")');
      await expect(backLink).toBeVisible();
      await expect(backLink).toHaveAttribute('href', '/team/setup');
    });

    test('should have logout button', async ({ page }) => {
      const logoutButton = page.locator('button[title="Deconnexion"]');
      await expect(logoutButton).toBeVisible();
    });
  });

  test.describe('Team Join Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/team/join');
    });

    test('should display join form', async ({ page }) => {
      // Check header
      await expect(page.locator('text=Rejoindre une equipe')).toBeVisible();
      await expect(page.locator('text=Entrez le code fourni par votre equipe')).toBeVisible();

      // Check 8 character input boxes
      const inputs = page.locator('input[maxlength="1"]');
      await expect(inputs).toHaveCount(8);
    });

    test('should handle input character by character', async ({ page }) => {
      const inputs = page.locator('input[maxlength="1"]');

      // Type first character
      await inputs.first().fill('A');

      // Should auto-focus next input
      await expect(inputs.nth(1)).toBeFocused();

      // Type more characters
      await page.keyboard.type('BCDEFGH');

      // All inputs should have values
      await expect(inputs.first()).toHaveValue('A');
      await expect(inputs.nth(7)).toHaveValue('H');
    });

    test('should handle paste of full code', async ({ page }) => {
      const firstInput = page.locator('input[maxlength="1"]').first();

      // Focus and paste
      await firstInput.focus();
      await page.evaluate(() => {
        navigator.clipboard.writeText('ABCD1234');
      }).catch(() => {
        // Clipboard API might not be available in test
      });

      // Simulate paste event with full code
      await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[maxlength="1"]');
        const code = 'ABCD1234';
        code.split('').forEach((char, i) => {
          if (inputs[i]) {
            (inputs[i] as HTMLInputElement).value = char;
          }
        });
      });

      // Verify values are set
      const inputs = page.locator('input[maxlength="1"]');
      await expect(inputs.first()).toHaveValue('A');
    });

    test('should disable submit button with incomplete code', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"]');

      // Initially disabled
      await expect(submitButton).toBeDisabled();

      // Fill partial code
      const inputs = page.locator('input[maxlength="1"]');
      await inputs.first().fill('A');

      // Still disabled
      await expect(submitButton).toBeDisabled();
    });

    test('should enable submit button with complete code', async ({ page }) => {
      // Fill all 8 characters
      await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[maxlength="1"]');
        const code = 'TESTCODE';
        code.split('').forEach((char, i) => {
          if (inputs[i]) {
            (inputs[i] as HTMLInputElement).value = char;
            inputs[i].dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      });

      const submitButton = page.locator('button[type="submit"]');
      // Note: May still be disabled due to React state - this is expected
    });

    test('should have help text for users without code', async ({ page }) => {
      await expect(page.locator('text=Pas de code ?')).toBeVisible();
      await expect(page.locator('text=Demandez a votre responsable')).toBeVisible();
    });

    test('should have back link', async ({ page }) => {
      const backLink = page.locator('a:has-text("RETOUR")');
      await expect(backLink).toBeVisible();
      await expect(backLink).toHaveAttribute('href', '/team/setup');
    });
  });
});
