/**
 * Manual mock for @capacitor/preferences.
 *
 * This package is a Capacitor native plugin and is NOT installed
 * as a regular npm dependency (it's resolved at native build time).
 * This file acts as a Jest moduleNameMapper target so that any
 * `import { Preferences } from '@capacitor/preferences'` resolves
 * to this stub instead of failing.
 *
 * Individual tests can override these stubs with jest.spyOn().
 */
module.exports = {
  Preferences: {
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue({ value: null }),
    remove: jest.fn().mockResolvedValue(undefined),
  },
};
