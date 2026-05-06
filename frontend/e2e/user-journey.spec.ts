import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journey', () => {
  
  test('Simulate complete user journey: login, add product, sort, and logout', async ({ page }) => {
    
    // 1. Open app & Register (Welcome page -> Register)
    await page.goto('/');
    // Dismiss alerts (like "User already exists") so Playwright doesn't get stuck
    page.on('dialog', dialog => dialog.dismiss().catch(() => {}));
    
    try { await page.locator('ion-button[href="/tabs/register"]').click({ timeout: 2000 }); } catch (e) { await page.goto('/tabs/register'); }
    await page.locator('app-register').getByRole('textbox', { name: 'Email' }).fill('test@example.com');
    await page.locator('app-register').getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.locator('app-register').getByRole('textbox', { name: 'Confirm Password' }).fill('Password123!');
    await page.locator('app-register ion-button', { hasText: /register|submit/i }).click();

    // 2. Login
    // Since registration might fail (user exists), we force navigation to login.
    await page.goto('/tabs/login');
    await page.locator('app-login').getByRole('textbox', { name: 'Email' }).fill('test@example.com');
    await page.locator('app-login').getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.locator('app-login ion-button', { hasText: /log in|login|submit/i }).click();

    // 3. Add a product 
    // The app auto-navigates to /tabs/home on successful login. Do not use page.goto here to avoid race conditions!
    // We target the inner button because the outer fab container isn't clickable.
    await page.locator('app-home #add-product-modal ion-fab-button').click();
    
    // Note: Since we are in a browser and cannot use the native Capacitor camera ('OTA KUVA!'),
    // we bypass the OCR and fill the form directly for E2E testing.
    await page.locator('app-add-product').getByRole('textbox', { name: 'Product Name' }).fill('Flour');
    await page.locator('app-add-product ion-button', { hasText: /save|submit|add/i }).click();

    // 4. See it on the home list
    await expect(page.locator('app-home ion-item, app-home .product-list-item').filter({ hasText: 'Flour' }).first()).toBeVisible();

    // 5. Log out 
    await page.goto('/tabs/settings');
    await page.locator('app-settings ion-button', { hasText: /log out/i }).click();
    
    // 6. Log back in
    await page.goto('/tabs/login');
    await page.locator('app-login').getByRole('textbox', { name: 'Email' }).fill('test@example.com');
    await page.locator('app-login').getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.locator('app-login ion-button', { hasText: /log in|login|submit/i }).click();

    // 7. Confirm the product is still saved
    // Again, wait for auto-navigate to /tabs/home
    await expect(page.locator('app-home ion-item, app-home .product-list-item').filter({ hasText: 'Flour' }).first()).toBeVisible();
  });

});
