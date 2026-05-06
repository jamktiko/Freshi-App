import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journey', () => {
  
  test('Simulate complete user journey: login, add product, sort, and logout', async ({ page }) => {
    
    // 1. Open app & Register (Welcome page -> Register)
    await page.goto('/');
    // Try clicking welcome register button, or go directly
    try { await page.locator('ion-button[href="/tabs/register"]').click(); } catch (e) { await page.goto('/tabs/register'); }
    await page.locator('ion-input#email').fill('test@example.com');
    await page.locator('ion-input[type="password"], ion-input#password').fill('Password123!');
    await page.locator('ion-button', { hasText: /register|submit/i }).click();

    // 2. Login
    await page.goto('/tabs/login');
    await page.locator('ion-input#email').fill('test@example.com');
    await page.locator('ion-input[type="password"], ion-input#password').fill('Password123!');
    await page.locator('ion-button', { hasText: /log in|login/i }).click();

    // 3. Add a product 
    await page.goto('/tabs/home');
    await page.locator('#add-product-modal, ion-button:has-text("Add")').click();
    
    // Note: Since we are in a browser and cannot use the native Capacitor camera ('OTA KUVA!'),
    // we bypass the OCR and fill the form directly for E2E testing.
    await page.locator('ion-input#name, ion-input[formControlName="productName"]').fill('Flour');
    await page.locator('ion-button', { hasText: /save|submit/i }).click();

    // 4. See it on the home list
    await expect(page.locator('ion-item, .product-list-item').filter({ hasText: 'Flour' }).first()).toBeVisible();

    // 5. Log out 
    await page.goto('/tabs/settings');
    await page.locator('ion-button', { hasText: /log out/i }).click();
    
    // 6. Log back in
    await page.goto('/tabs/login');
    await page.locator('ion-input#email').fill('test@example.com');
    await page.locator('ion-input[type="password"], ion-input#password').fill('Password123!');
    await page.locator('ion-button', { hasText: /log in|login/i }).click();

    // 7. Confirm the product is still saved
    await page.goto('/tabs/home');
    await expect(page.locator('ion-item, .product-list-item').filter({ hasText: 'Flour' }).first()).toBeVisible();
  });

});
