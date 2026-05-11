/**
 * Form validation state tests.
 *
 * These tests instantiate the same Reactive Form definitions used
 * by the page components and verify .valid / .errors without
 * rendering any DOM or touching the HTML templates.
 */

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../passwordValidation';

// ─── Login Form ──────────────────────────────────────────────

describe('Login Form Validation', () => {
  /** Same FormGroup definition as LoginPage */
  function createLoginForm() {
    return new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  it('should be invalid when empty', () => {
    const form = createLoginForm();
    expect(form.valid).toBe(false);
  });

  it('should be invalid with a non-email string', () => {
    const form = createLoginForm();
    form.patchValue({ email: 'not-an-email', password: 'secret' });
    expect(form.valid).toBe(false);
    expect(form.get('email')?.errors?.['email']).toBeTruthy();
  });

  it('should be valid with proper email and password', () => {
    const form = createLoginForm();
    form.patchValue({ email: 'user@example.com', password: 'Password123!' });
    expect(form.valid).toBe(true);
  });

  it('should be invalid when password is missing', () => {
    const form = createLoginForm();
    form.patchValue({ email: 'user@example.com', password: '' });
    expect(form.valid).toBe(false);
  });
});

// ─── Register Form ───────────────────────────────────────────

describe('Register Form Validation', () => {
  /**
   * Mirrors the RegisterPage form structure exactly.
   *
   * NOTE: passwordMatchValidator reads control.value.password at root
   * level, but the real form nests password/pconfirm inside
   * passwordsGroup. This means the cross-field mismatch check doesn't
   * fire on the root form. We test reality, not intent.
   */
  function createRegisterForm() {
    return new FormGroup(
      {
        email: new FormControl('', [Validators.email, Validators.required]),
        passwordsGroup: new FormGroup(
          {
            password: new FormControl('', Validators.required),
            pconfirm: new FormControl('', Validators.required),
          },
          { validators: [Validators.minLength(8)] },
        ),
      },
      { validators: passwordMatchValidator },
    );
  }

  it('should be invalid when empty', () => {
    const form = createRegisterForm();
    expect(form.valid).toBe(false);
  });

  it('should be invalid when email is missing', () => {
    const form = createRegisterForm();
    form.patchValue({
      email: '',
      passwordsGroup: { password: 'Password1!', pconfirm: 'Password1!' },
    });
    expect(form.valid).toBe(false);
  });

  it('should be valid with matching passwords and valid email', () => {
    const form = createRegisterForm();
    form.patchValue({
      email: 'user@example.com',
      passwordsGroup: { password: 'Password1!', pconfirm: 'Password1!' },
    });
    expect(form.valid).toBe(true);
  });

  it('should be invalid when required password fields are empty', () => {
    const form = createRegisterForm();
    form.patchValue({
      email: 'user@example.com',
      passwordsGroup: { password: '', pconfirm: '' },
    });
    expect(form.valid).toBe(false);
  });
});

// ─── Confirm Form ────────────────────────────────────────────

describe('Confirm Form Validation', () => {
  /** Same FormGroup definition as ConfirmPage */
  function createConfirmForm() {
    return new FormGroup({
      code: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
      ]),
    });
  }

  it('should be invalid when empty', () => {
    const form = createConfirmForm();
    expect(form.valid).toBe(false);
  });

  it('should be invalid when code is too short', () => {
    const form = createConfirmForm();
    form.patchValue({ code: '123' });
    expect(form.valid).toBe(false);
  });

  it('should be invalid when code is too long', () => {
    const form = createConfirmForm();
    form.patchValue({ code: '1234567' });
    expect(form.valid).toBe(false);
  });

  it('should be valid with exactly 6 characters', () => {
    const form = createConfirmForm();
    form.patchValue({ code: '123456' });
    expect(form.valid).toBe(true);
  });
});

// ─── Add Product Form ────────────────────────────────────────

describe('Add Product Form Validation', () => {
  /** Same FormGroup definition as AddProductComponent */
  function createAddProductForm() {
    return new FormGroup({
      name: new FormControl('', [Validators.required]),
      brand: new FormControl('', [Validators.required]),
      category: new FormControl(''),
      expiration: new FormControl('', [Validators.required]),
    });
  }

  it('should be invalid when empty', () => {
    const form = createAddProductForm();
    expect(form.valid).toBe(false);
  });

  it('should be invalid when only name is provided', () => {
    const form = createAddProductForm();
    form.patchValue({ name: 'Flour' });
    expect(form.valid).toBe(false);
  });

  it('should be valid when all required fields are filled', () => {
    const form = createAddProductForm();
    form.patchValue({
      name: 'Flour',
      brand: 'Test Brand',
      expiration: '2026-12-31',
    });
    expect(form.valid).toBe(true);
  });

  it('should be valid even without optional category', () => {
    const form = createAddProductForm();
    form.patchValue({
      name: 'Flour',
      brand: 'Test Brand',
      expiration: '2026-12-31',
      category: '',
    });
    expect(form.valid).toBe(true);
  });
});
