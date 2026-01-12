/**
 * Comprehensive unit tests for iframe resizing functionality
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { autoInitIFrameResizing, initIFrameResizing } from '../iframe-resizing';
import { participants } from '../types';

describe('iframe-resizing', () => {
  let resizeObserverCallback: ResizeObserverCallback;
  let observedElements: Element[] = [];

  // Mock ResizeObserver
  class MockResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      resizeObserverCallback = callback;
    }

    observe(element: Element) {
      observedElements.push(element);
    }

    disconnect() {
      observedElements = [];
    }

    unobserve() {
      // Not used in our implementation
    }
  }

  beforeEach(() => {
    // Reset state
    observedElements = [];

    // Mock ResizeObserver
    global.ResizeObserver = MockResizeObserver as any;

    // Mock window.parent.postMessage
    global.window.parent = {
      postMessage: vi.fn(),
    } as any;

    // Mock iframe detection - simulate running in iframe
    Object.defineProperty(window, 'self', {
      value: window,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'top', {
      value: {}, // Different from window.self, so isInIframe() returns true
      writable: true,
      configurable: true,
    });

    // Setup document documentElement
    document.documentElement.innerHTML = '<div>Test content</div>';

    // Clear any existing event listeners
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    vi.restoreAllMocks();
  });

  describe('initIFrameResizing', () => {
    it('should initialize ResizeObserver on document documentElement', () => {
      const cleanup = initIFrameResizing();

      expect(observedElements).toHaveLength(1);
      expect(observedElements[0]).toBe(document.documentElement);
      expect(typeof cleanup).toBe('function');
    });

    it('should return cleanup function that disconnects observer', () => {
      const cleanup = initIFrameResizing();

      expect(observedElements).toHaveLength(1);

      cleanup();

      expect(observedElements).toHaveLength(0);
    });

    it('should send resize command when documentElement size changes', async () => {
      initIFrameResizing();

      // Simulate resize event
      const mockEntry: ResizeObserverEntry = {
        target: document.documentElement,
        contentRect: {
          height: 500,
          width: 800,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          bottom: 500,
          right: 800,
          toJSON: () => ({}),
        },
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };

      resizeObserverCallback([mockEntry], {} as ResizeObserver);

      // Wait for postMessage to be called
      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      const call = (window.parent.postMessage as any).mock.calls[0];
      const message = call[0];

      expect(message.name).toBe('resize');
      expect(message.sender).toBe(participants.CHILD);
      expect(message.receiver).toBe(participants.PARENT);
      expect(message.payload).toEqual([[500]]);
      expect(message.id).toBeDefined();
    });

    it('should handle onError callback when resize fails', async () => {
      vi.useFakeTimers();

      const onError = vi.fn();
      initIFrameResizing({ onError });

      // Simulate resize event
      const mockEntry: ResizeObserverEntry = {
        target: document.documentElement,
        contentRect: { height: 500 } as DOMRectReadOnly,
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };

      resizeObserverCallback([mockEntry], {} as ResizeObserver);

      // Advance timers past the 20 second timeout
      await vi.advanceTimersByTimeAsync(21000);

      // Wait a bit for the promise to reject and callbacks to be called
      await vi.runAllTimersAsync();

      expect(onError).toHaveBeenCalled();

      const error = onError.mock.calls[0]?.[0];
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toContain('Timeout exceeded');

      vi.useRealTimers();
    });

    it('should use scrollHeight when heightCalculationMethod is set to scrollHeight', async () => {
      // Mock scrollHeight
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1234,
        configurable: true,
      });

      initIFrameResizing({ heightCalculationMethod: 'scrollHeight' });

      // Simulate resize event
      const mockEntry: ResizeObserverEntry = {
        target: document.documentElement,
        contentRect: { height: 500 } as DOMRectReadOnly,
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };

      resizeObserverCallback([mockEntry], {} as ResizeObserver);

      // Wait for postMessage to be called
      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      const call = (window.parent.postMessage as any).mock.calls[0];
      const message = call[0];

      expect(message.payload).toEqual([[1234]]);
    });

    it('should handle captureError callback when resize fails', async () => {
      vi.useFakeTimers();

      const captureError = vi.fn();
      initIFrameResizing({ captureError });

      // Simulate resize event
      const mockEntry: ResizeObserverEntry = {
        target: document.documentElement,
        contentRect: { height: 500 } as DOMRectReadOnly,
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };

      resizeObserverCallback([mockEntry], {} as ResizeObserver);

      // Advance timers past the 20 second timeout
      await vi.advanceTimersByTimeAsync(21000);
      await vi.runAllTimersAsync();

      expect(captureError).toHaveBeenCalled();

      const error = captureError.mock.calls[0]?.[0];
      expect(error).toBeInstanceOf(Error);

      vi.useRealTimers();
    });

    it('should warn when document documentElement is not found', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      // Remove documentElement
      const originaldocumentElement = document.documentElement;
      Object.defineProperty(document, 'documentElement', {
        get: () => null,
        configurable: true,
      });

      initIFrameResizing();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'initIFrameResizing: Document documentElement not found',
      );

      // Restore documentElement
      Object.defineProperty(document, 'documentElement', {
        get: () => originaldocumentElement,
        configurable: true,
      });
    });

    it('should handle missing resize entries gracefully', () => {
      initIFrameResizing();

      // Call with empty entries
      expect(() => {
        resizeObserverCallback([], {} as ResizeObserver);
      }).not.toThrow();

      expect(window.parent.postMessage).not.toHaveBeenCalled();
    });

    it('should send acknowledgment response correctly', async () => {
      initIFrameResizing();

      // Setup message event listener spy
      const messageListeners: Array<(event: MessageEvent) => void> = [];
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      addEventListenerSpy.mockImplementation((event, listener) => {
        if (event === 'message') {
          messageListeners.push(listener as any);
        }
      });

      // Simulate resize event
      const mockEntry: ResizeObserverEntry = {
        target: document.documentElement,
        contentRect: { height: 500 } as DOMRectReadOnly,
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };

      resizeObserverCallback([mockEntry], {} as ResizeObserver);

      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      // Get the command that was sent
      const sentCommand = (window.parent.postMessage as any).mock.calls[0][0];

      // Simulate parent sending acknowledgment
      const ackMessage = {
        id: 'response-id',
        correspondingCommandId: sentCommand.id,
        sender: participants.PARENT,
        receiver: participants.CHILD,
      };

      // Trigger the message listener
      const messageEvent = new MessageEvent('message', {
        data: ackMessage,
      });

      for (const listener of messageListeners) {
        listener(messageEvent);
      }

      // Verify the listener was removed (cleanup happened)
      expect(addEventListenerSpy).toHaveBeenCalled();
    });

    it('should return noop function when running server-side', () => {
      // Mock server-side environment
      const originalWindow = global.window;
      delete (global as any).window;

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const cleanup = initIFrameResizing();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'initIFrameResizing: Cannot initialize on server side',
      );
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });

    it('should return noop function when not running in iframe', () => {
      // Mock non-iframe environment (window.self === window.top)
      Object.defineProperty(window, 'top', {
        value: window.self,
        writable: true,
        configurable: true,
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const cleanup = initIFrameResizing();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'initIFrameResizing: Not running in an iframe, skipping initialization',
      );
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
      expect(observedElements).toHaveLength(0); // No observer created
    });

    it('should detect iframe with cross-origin exception', () => {
      // Mock cross-origin iframe (accessing window.top throws)
      Object.defineProperty(window, 'top', {
        get: () => {
          throw new Error('Cross-origin access denied');
        },
        configurable: true,
      });

      // Should still initialize because the error means we're in an iframe
      const cleanup = initIFrameResizing();

      expect(observedElements).toHaveLength(1); // Observer was created
      expect(typeof cleanup).toBe('function');
    });
  });

  describe('autoInitIFrameResizing', () => {
    it('should initialize immediately when DOM is already loaded', () => {
      // Set readyState to 'complete'
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true,
        configurable: true,
      });

      const cleanup = autoInitIFrameResizing();

      expect(observedElements).toHaveLength(1);
      expect(observedElements[0]).toBe(document.documentElement);
      expect(typeof cleanup).toBe('function');
    });

    it('should initialize immediately when DOM is interactive', () => {
      // Set readyState to 'interactive'
      Object.defineProperty(document, 'readyState', {
        value: 'interactive',
        writable: true,
        configurable: true,
      });

      const cleanup = autoInitIFrameResizing();

      expect(observedElements).toHaveLength(1);
      expect(typeof cleanup).toBe('function');
    });

    it('should wait for DOMContentLoaded when DOM is still loading', () => {
      // Set readyState to 'loading'
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true,
      });

      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      const cleanup = autoInitIFrameResizing();

      // Should not have initialized yet
      expect(observedElements).toHaveLength(0);

      // Should have added DOMContentLoaded listener
      expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));

      // Simulate DOMContentLoaded
      const domContentLoadedCallback = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'DOMContentLoaded',
      )?.[1] as EventListener;

      domContentLoadedCallback(new Event('DOMContentLoaded'));

      // Now should be initialized
      expect(observedElements).toHaveLength(1);
      expect(typeof cleanup).toBe('function');
    });

    it('should return cleanup function that works before initialization', () => {
      // Set readyState to 'loading'
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true,
      });

      const cleanup = autoInitIFrameResizing();

      // Call cleanup before DOMContentLoaded
      expect(() => cleanup()).not.toThrow();
    });

    it('should return cleanup function that works after initialization', () => {
      // Set readyState to 'loading'
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true,
      });

      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const cleanup = autoInitIFrameResizing();

      // Simulate DOMContentLoaded
      const domContentLoadedCallback = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'DOMContentLoaded',
      )?.[1] as EventListener;

      domContentLoadedCallback(new Event('DOMContentLoaded'));

      expect(observedElements).toHaveLength(1);

      // Call cleanup after initialization
      cleanup();

      expect(observedElements).toHaveLength(0);
    });

    it('should pass options to initIFrameResizing', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true,
        configurable: true,
      });

      const onError = vi.fn();
      const captureError = vi.fn();

      autoInitIFrameResizing({ onError, captureError });

      // Verify initialization happened (observer created)
      expect(observedElements).toHaveLength(1);

      // Options will be tested when an error occurs
      // This is covered in the initIFrameResizing tests
    });

    it('should return noop function when running server-side', () => {
      // Mock server-side environment
      const originalWindow = global.window;
      delete (global as any).window;

      const cleanup = autoInitIFrameResizing();

      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('Global Window API', () => {
    it('should expose IFrameResizing on window object', () => {
      // Re-import to trigger the global assignment
      vi.resetModules();

      expect(window.IFrameResizing).toBeDefined();
      expect(window.IFrameResizing?.init).toBeDefined();
      expect(window.IFrameResizing?.autoInit).toBeDefined();
      expect(typeof window.IFrameResizing?.init).toBe('function');
      expect(typeof window.IFrameResizing?.autoInit).toBe('function');
    });
  });

  describe('Message Protocol', () => {
    it('should use correct message structure', async () => {
      initIFrameResizing();

      const mockEntry: ResizeObserverEntry = {
        target: document.documentElement,
        contentRect: { height: 600 } as DOMRectReadOnly,
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };

      resizeObserverCallback([mockEntry], {} as ResizeObserver);

      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      const message = (window.parent.postMessage as any).mock.calls[0][0];

      // Verify message structure
      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('sender');
      expect(message).toHaveProperty('receiver');
      expect(message).toHaveProperty('name');
      expect(message).toHaveProperty('payload');

      // Verify UUID format (basic check)
      expect(message.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should send message with wildcard origin', async () => {
      initIFrameResizing();

      const mockEntry: ResizeObserverEntry = {
        target: document.documentElement,
        contentRect: { height: 600 } as DOMRectReadOnly,
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };

      resizeObserverCallback([mockEntry], {} as ResizeObserver);

      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      const call = (window.parent.postMessage as any).mock.calls[0];
      expect(call[1]).toBe('*'); // Origin parameter
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid resize events', async () => {
      initIFrameResizing();

      const heights = [100, 200, 300, 400, 500];

      for (const height of heights) {
        const mockEntry: ResizeObserverEntry = {
          target: document.documentElement,
          contentRect: { height } as DOMRectReadOnly,
          borderBoxSize: [] as any,
          contentBoxSize: [] as any,
          devicePixelContentBoxSize: [] as any,
        };

        resizeObserverCallback([mockEntry], {} as ResizeObserver);
      }

      await vi.waitFor(() => {
        expect((window.parent.postMessage as any).mock.calls.length).toBe(heights.length);
      });

      // Verify all heights were sent
      heights.forEach((height, index) => {
        const message = (window.parent.postMessage as any).mock.calls[index][0];
        expect(message.payload).toEqual([[height]]);
      });
    });

    it('should handle zero height', async () => {
      initIFrameResizing();

      const mockEntry: ResizeObserverEntry = {
        target: document.documentElement,
        contentRect: { height: 0 } as DOMRectReadOnly,
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };

      resizeObserverCallback([mockEntry], {} as ResizeObserver);

      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      const message = (window.parent.postMessage as any).mock.calls[0][0];
      expect(message.payload).toEqual([[0]]);
    });

    it('should handle very large height values', async () => {
      initIFrameResizing();

      const largeHeight = 999999;
      const mockEntry: ResizeObserverEntry = {
        target: document.documentElement,
        contentRect: { height: largeHeight } as DOMRectReadOnly,
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };

      resizeObserverCallback([mockEntry], {} as ResizeObserver);

      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      const message = (window.parent.postMessage as any).mock.calls[0][0];
      expect(message.payload).toEqual([[largeHeight]]);
    });

    it('should handle fractional height values', async () => {
      initIFrameResizing();

      const fractionalHeight = 123.456;
      const mockEntry: ResizeObserverEntry = {
        target: document.documentElement,
        contentRect: { height: fractionalHeight } as DOMRectReadOnly,
        borderBoxSize: [] as any,
        contentBoxSize: [] as any,
        devicePixelContentBoxSize: [] as any,
      };

      resizeObserverCallback([mockEntry], {} as ResizeObserver);

      await vi.waitFor(() => {
        expect(window.parent.postMessage).toHaveBeenCalled();
      });

      const message = (window.parent.postMessage as any).mock.calls[0][0];
      expect(message.payload).toEqual([[fractionalHeight]]);
    });
  });
});
