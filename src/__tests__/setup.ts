/**
 * Test setup file for Vitest
 * Configures global test environment and mocks
 */

import { afterEach, beforeEach, vi } from 'vitest';

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  // Reset modules to ensure clean state
  vi.resetModules();
});

// Cleanup after each test
afterEach(() => {
  vi.restoreAllMocks();
});
