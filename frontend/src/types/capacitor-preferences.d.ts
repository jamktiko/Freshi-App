/**
 * Type declarations for @capacitor/preferences.
 *
 * This package is a Capacitor native plugin that isn't installed
 * as a direct npm dependency. This declaration file allows
 * TypeScript to compile imports from '@capacitor/preferences'
 * in test files. The actual implementation is provided by
 * jest.config.js moduleNameMapper → src/__mocks__/capacitor-preferences.js.
 */
declare module '@capacitor/preferences' {
  export interface GetResult {
    value: string | null;
  }

  export interface SetOptions {
    key: string;
    value: string;
  }

  export interface GetOptions {
    key: string;
  }

  export interface RemoveOptions {
    key: string;
  }

  export const Preferences: {
    set(options: SetOptions): Promise<void>;
    get(options: GetOptions): Promise<GetResult>;
    remove(options: RemoveOptions): Promise<void>;
  };
}
