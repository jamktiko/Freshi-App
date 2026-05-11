/**
 * Unit tests for passwordMatchValidator.
 *
 * This is a pure function validator — no Angular DI or TestBed required.
 * We build a minimal AbstractControl-like object and pass it in.
 */

import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from './passwordValidation';

describe('passwordMatchValidator', () => {
  /**
   * Helper: creates a FormGroup whose `.value` shape matches
   * what the validator reads: `{ password, pconfirm }`.
   */
  function buildGroup(password: string, pconfirm: string): FormGroup {
    return new FormGroup(
      {
        password: new FormControl(password),
        pconfirm: new FormControl(pconfirm),
      },
    );
  }

  it('should return null when passwords match', () => {
    const group = buildGroup('Password123!', 'Password123!');
    const result = passwordMatchValidator(group);
    expect(result).toBeNull();
  });

  it('should return { passwordMismatch: true } when passwords differ', () => {
    const group = buildGroup('Password123!', 'DifferentPassword!');
    const result = passwordMatchValidator(group);
    expect(result).toEqual({ passwordMismatch: true });
  });

  it('should return { passwordMismatch: true } when one password is empty', () => {
    const group = buildGroup('Password123!', '');
    const result = passwordMatchValidator(group);
    expect(result).toEqual({ passwordMismatch: true });
  });

  it('should return null when both passwords are empty', () => {
    const group = buildGroup('', '');
    const result = passwordMatchValidator(group);
    expect(result).toBeNull();
  });
});
