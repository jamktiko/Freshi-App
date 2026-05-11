/** @type {import('jest').Config} */
const { createCjsPreset } = require('jest-preset-angular/presets');

const presetConfig = createCjsPreset();

module.exports = {
  ...presetConfig,
  setupFilesAfterEnv: ['<rootDir>/setup.jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',       // Playwright handles E2E
    '<rootDir>/www/',
    '<rootDir>/android/',
  ],
  transformIgnorePatterns: [
    // Allow Jest to transform ESM packages from node_modules
    'node_modules/(?!(@angular|@ionic|@capacitor|aws-amplify|@aws-amplify|rxjs|tslib|ionicons|localforage-cordovasqlitedriver|cordova-sqlite-storage)/)',
  ],
  moduleNameMapper: {
    // @capacitor/preferences is not installed as a direct npm dep
    // (it's a Capacitor native plugin). Route imports to our manual mock.
    '@capacitor/preferences': '<rootDir>/src/__mocks__/capacitor-preferences.js',
  },
};
