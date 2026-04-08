/**
 * Unit tests for pushToDataLayer
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pushToDataLayer } from '../datalayer-push';
import { participants } from '../types';

describe('pushToDataLayer', () => {
  beforeEach(() => {
    global.window.parent = {
      postMessage: vi.fn(),
    } as any;

    // Simulate running inside an iframe
    Object.defineProperty(window, 'self', {
      value: window,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'top', {
      value: {}, // different from window.self
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function getSentCommand() {
    const calls = (window.parent.postMessage as any).mock.calls;
    return calls[calls.length - 1][0];
  }

  function ackLastCommand() {
    const command = getSentCommand();
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          id: 'response-id',
          correspondingCommandId: command.id,
          sender: participants.PARENT,
          receiver: participants.CHILD,
          payload: undefined,
        },
      }),
    );
  }

  describe('guard conditions', () => {
    it('should warn and return noop when running server-side', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const result = pushToDataLayer({ event: 'pageView' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'pushToDataLayer: Cannot initialize on server side',
      );
      expect(typeof result).toBe('function');
      expect(() => (result as () => void)()).not.toThrow();

      global.window = originalWindow;
    });

    it('should warn and return noop when not in an iframe', () => {
      Object.defineProperty(window, 'top', {
        value: window.self,
        writable: true,
        configurable: true,
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const result = pushToDataLayer({ event: 'pageView' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('pushToDataLayer: Not running in an iframe');
      expect(typeof result).toBe('function');
      expect(() => (result as () => void)()).not.toThrow();
      expect(window.parent.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('command dispatch', () => {
    it('should send a pushToDataLayer command to the parent', async () => {
      pushToDataLayer({ event: 'pageView' });

      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      const command = getSentCommand();
      expect(command.name).toBe('handleDataLayerEvent');
      expect(command.sender).toBe(participants.CHILD);
      expect(command.receiver).toBe(participants.PARENT);
    });

    it('should include the event object in the payload', async () => {
      const event = { event: 'purchase', value: 100 };
      pushToDataLayer(event);

      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      expect(getSentCommand().payload).toEqual([[event]]);
    });

    it('should send with wildcard origin', async () => {
      pushToDataLayer({ event: 'pageView' });

      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      expect(window.parent.postMessage).toHaveBeenCalledWith(expect.any(Object), '*');
    });
  });

  describe('error handling', () => {
    it('should warn to console when the command times out', async () => {
      vi.useFakeTimers();
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      pushToDataLayer({ event: 'pageView' });

      await vi.advanceTimersByTimeAsync(21000);
      await vi.runAllTimersAsync();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Timeout exceeded for command handleDataLayerEvent'),
      );

      vi.useRealTimers();
    });

    it('should call onError when the command times out', async () => {
      vi.useFakeTimers();
      const onError = vi.fn();

      pushToDataLayer({ event: 'pageView' }, { onError });

      await vi.advanceTimersByTimeAsync(21000);
      await vi.runAllTimersAsync();

      expect(onError).toHaveBeenCalledOnce();
      const error = onError.mock.calls[0]?.[0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('Timeout exceeded');

      vi.useRealTimers();
    });

    it('should call captureError when the command times out', async () => {
      vi.useFakeTimers();
      const captureError = vi.fn();

      pushToDataLayer({ event: 'pageView' }, { captureError });

      await vi.advanceTimersByTimeAsync(21000);
      await vi.runAllTimersAsync();

      expect(captureError).toHaveBeenCalledOnce();
      const error = captureError.mock.calls[0]?.[0];
      expect(error).toBeInstanceOf(Error);

      vi.useRealTimers();
    });

    it('should call both onError and captureError when the command times out', async () => {
      vi.useFakeTimers();
      const onError = vi.fn();
      const captureError = vi.fn();

      pushToDataLayer({ event: 'pageView' }, { onError, captureError });

      await vi.advanceTimersByTimeAsync(21000);
      await vi.runAllTimersAsync();

      expect(onError).toHaveBeenCalledOnce();
      expect(captureError).toHaveBeenCalledOnce();

      vi.useRealTimers();
    });

    it('should not call onError or captureError on success', async () => {
      const onError = vi.fn();
      const captureError = vi.fn();

      pushToDataLayer({ event: 'pageView' }, { onError, captureError });

      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      ackLastCommand();

      // Give microtasks a chance to settle
      await new Promise((r) => setTimeout(r, 0));

      expect(onError).not.toHaveBeenCalled();
      expect(captureError).not.toHaveBeenCalled();
    });
  });
});
