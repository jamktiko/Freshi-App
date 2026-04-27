import { jest } from '@jest/globals';
import { checkExpiry } from '../../utils/expiry.js';

describe('Expiry Date Logic', () => {
  beforeAll(() => {
    // Mock the current date to be predictable (e.g., 2026-04-27)
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-27T00:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('returns "expired" for past dates', () => {
    expect(checkExpiry('2026-04-20')).toBe('expired');
  });

  test('returns "expiring_soon" for dates within 7 days', () => {
    expect(checkExpiry('2026-04-30')).toBe('expiring_soon');
    expect(checkExpiry('2026-05-04')).toBe('expiring_soon'); // Exactly 7 days
  });

  test('returns "fresh" for dates further in the future', () => {
    expect(checkExpiry('2026-05-15')).toBe('fresh');
    expect(checkExpiry('2027-01-01')).toBe('fresh');
  });
});
