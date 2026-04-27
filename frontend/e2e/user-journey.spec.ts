import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journey', () => {
  
  // Wrapped in .skip() until the frontend UI actually exists
  test.skip('Simulate complete user journey: login, add product, sort, and logout', async ({ page }) => {
    
    // 1. Open app & Register
    await page.goto('/');
    await page.click('#register-tab');
    await page.fill('#email-input', 'test@example.com');
    await page.fill('#password-input', 'Password123!');
    await page.click('#register-submit-btn');

    // 2. Login
    await page.click('#login-tab');
    await page.fill('#login-email', 'test@example.com');
    await page.fill('#login-password', 'Password123!');
    await page.click('#login-btn');

    // 3. Add a product with photo
    await page.click('#add-product-btn');
    await page.setInputFiles('#camera-upload', 'test-assets/dummy-receipt.jpg');
    // Assuming the edge OCR and backend AI fill in the form
    await expect(page.locator('#product-name-input')).toHaveValue('Flour');
    await page.click('#save-product-btn');

    // 4. See it on the home list
    await expect(page.locator('.product-list-item').first()).toContainText('Flour');

    // 5. Sort list by expiry date
    await page.click('#sort-expiry-btn');
    // Verify sorting logic here...

    // 6. Log out and back in
    await page.click('#logout-btn');
    await page.fill('#login-email', 'test@example.com');
    await page.fill('#login-password', 'Password123!');
    await page.click('#login-btn');

    // 7. Confirm the product is still saved
    await expect(page.locator('.product-list-item').first()).toContainText('Flour');
  });

});
