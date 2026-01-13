/**
 * Test setup - Mock browser globals for Node.js test environment
 */

import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock as Storage;

// Mock confirm (always return true in tests)
global.confirm = vi.fn(() => true);

// Mock window if needed
if (typeof window === 'undefined') {
  (global as any).window = {
    localStorage: localStorageMock
  };
}
