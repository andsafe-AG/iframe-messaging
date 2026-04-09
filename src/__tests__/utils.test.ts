/**
 * Unit tests for utility functions
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isInIframe, isServerSide } from '../utils';

describe('utils', () => {
  describe('isServerSide', () => {
    it('should return false in a browser environment', () => {
      expect(isServerSide()).toBe(false);
    });

    it('should return true when window is undefined (server side)', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(isServerSide()).toBe(true);

      global.window = originalWindow;
    });
  });

  describe('isInIframe', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'self', {
        value: window,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'top', {
        value: window,
        writable: true,
        configurable: true,
      });
    });

    it('should return false when window.self equals window.top', () => {
      Object.defineProperty(window, 'top', {
        value: window,
        writable: true,
        configurable: true,
      });

      expect(isInIframe()).toBe(false);
    });

    it('should return true when window.self differs from window.top', () => {
      Object.defineProperty(window, 'top', {
        value: {}, // different object than window.self
        writable: true,
        configurable: true,
      });

      expect(isInIframe()).toBe(true);
    });

    it('should return true when accessing window.top throws a cross-origin error', () => {
      Object.defineProperty(window, 'top', {
        get: () => {
          throw new Error('Cross-origin access denied');
        },
        configurable: true,
      });

      expect(isInIframe()).toBe(true);
    });
  });
});
