import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API calls to mock the backend responses
    await page.route('**/items', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [{ id: '1', name: 'Mocked Item', expiryDate: '2026-05-20' }],
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Option to mock other endpoints if needed, mapping directly to Cognito responses if desired
    // await page.route('**/*cognito-idp*.amazonaws.com/**', async (route) => { ... });
  });

  test('UI smoke test: register, login, add product form, and logout', async ({
    page,
  }) => {
    // Allow extra time for real AWS Cognito network calls
    test.setTimeout(60000);

    // Dismiss alerts (like "User already exists") so Playwright doesn't get stuck
    page.on('dialog', (dialog) => dialog.dismiss().catch(() => {}));

    // 1. Open app & navigate to Register
    await page.goto('/');
    try {
      await page
        .locator('ion-button[href="/tabs/register"]')
        .click({ timeout: 3000 });
    } catch (e) {
      await page.goto('/tabs/register');
    }

    // 2. Fill registration form and submit
    await page
      .locator('app-register')
      .getByRole('textbox', { name: 'Email' })
      .fill('test@example.com');
    await page
      .locator('app-register')
      .getByRole('textbox', { name: 'Password', exact: true })
      .fill('Password123!');
    await page
      .locator('app-register')
      .getByRole('textbox', { name: 'Confirm Password' })
      .fill('Password123!');
    await page
      .locator('app-register ion-button', { hasText: /register|submit/i })
      .click();
    // Wait briefly for Cognito response + potential alert dismissal
    await page.waitForTimeout(2000);

    // 3. Login (registration may fail if user exists, so we always force navigate to login)
    await page.goto('/tabs/login');
    await page
      .locator('app-login')
      .getByRole('textbox', { name: 'Email' })
      .fill('test@example.com');
    await page
      .locator('app-login')
      .getByRole('textbox', { name: 'Password', exact: true })
      .fill('Password123!');
    await page
      .locator('app-login ion-button', { hasText: /log in|login|submit/i })
      .click();

    // 4. Verify home page loaded after successful login
    await expect(page.locator('app-home')).toBeVisible({ timeout: 10000 });

    // 5. Open Add Product modal and fill the form
    await page.locator('app-home #add-product-modal ion-fab-button').click();
    await expect(page.locator('app-add-product')).toBeVisible({
      timeout: 5000,
    });

    // Fill all three required fields so the submit button becomes enabled
    await page
      .locator('app-add-product')
      .getByRole('textbox', { name: 'Product Name' })
      .fill('Flour');
    await page
      .locator('app-add-product')
      .getByRole('textbox', { name: 'Brand' })
      .fill('Test Brand');
    await page
      .locator('app-add-product')
      .getByRole('textbox', { name: 'Expiration date' })
      .fill('2026-12-31');
    // force:true bypasses Ionic's ion-list overlay that intercepts pointer events
    await page
      .locator('app-add-product ion-button', { hasText: /add/i })
      .click({ force: true });

    // 6. Verify modal dismissed and we're back on home
    await expect(page.locator('app-home')).toBeVisible({ timeout: 5000 });

    // 7. Navigate to settings and log out
    await page.goto('/tabs/settings');
    await expect(page.locator('app-settings')).toBeVisible({ timeout: 5000 });
    await page
      .locator('app-settings ion-button', { hasText: /log out/i })
      .click();
  });
});
