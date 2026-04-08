/**
 * Standalone iframe resizing script for applications
 *
 * This script provides automatic iframe height resizing functionality by monitoring
 * the document documentElement and communicating size changes to the parent window via postMessage.
 *
 * @packageDocumentation
 */

import { sendCommand } from './send-command';
import type { IFrameResizingOptions } from './types';
import { isInIframe, isServerSide } from './utils';

/**
 * Initializes iframe resizing functionality
 *
 * This function sets up a ResizeObserver on the document documentElement that automatically
 * communicates size changes to the parent window via postMessage.
 *
 * @param options - Configuration options
 * @returns Cleanup function to disconnect the observer
 *
 * @example
 * ```typescript
 * // Basic usage
 * const cleanup = initIFrameResizing();
 *
 * // With error handling
 * const cleanup = initIFrameResizing({
 *   onError: (error) => console.error('Failed to resize:', error),
 *   captureError: (error) => Sentry.captureException(error)
 * });
 *
 * // Cleanup when done
 * cleanup();
 * ```
 *
 * @public
 */
export function initIFrameResizing(options: IFrameResizingOptions = {}): () => void {
  const { onError, captureError, heightCalculationMethod = 'contentRect' } = options;

  if (isServerSide()) {
    console.warn('initIFrameResizing: Cannot initialize on server side');
    return () => {};
  }

  if (!isInIframe()) {
    console.warn('initIFrameResizing: Not running in an iframe, skipping initialization');
    return () => {};
  }

  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;

    const { contentRect } = entry;

    let height = contentRect.height;

    if (heightCalculationMethod === 'scrollHeight') {
      height = document.documentElement.scrollHeight;
    }

    sendCommand('resize', [height]).catch((error) => {
      console.warn(error.message);

      if (onError) {
        onError(error);
      }

      if (captureError) {
        captureError(error);
      }
    });
  });

  const { documentElement } = document;

  if (documentElement) {
    observer.observe(documentElement);
  } else {
    console.warn('initIFrameResizing: Document documentElement not found');
  }

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
}

/**
 * Auto-initializes iframe resizing when DOM is ready
 *
 * This is a convenience function that automatically waits for DOMContentLoaded
 * if the document is still loading, or initializes immediately if the DOM is ready.
 *
 * @param options - Configuration options (same as initIFrameResizing)
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * // Call this at the top level of your script
 * const cleanup = autoInitIFrameResizing({
 *   onError: (error) => console.error(error)
 * });
 *
 * // Or with no options
 * const cleanup = autoInitIFrameResizing();
 * ```
 *
 * @public
 */
export function autoInitIFrameResizing(options: IFrameResizingOptions = {}): () => void {
  if (isServerSide()) {
    return () => {};
  }

  if (document.readyState === 'loading') {
    let cleanup = () => {};

    document.addEventListener('DOMContentLoaded', () => {
      cleanup = initIFrameResizing(options);
    });

    return () => cleanup();
  } else {
    return initIFrameResizing(options);
  }
}

// For UMD/browser global usage
declare global {
  interface Window {
    IFrameResizing?: {
      init: typeof initIFrameResizing;
      autoInit: typeof autoInitIFrameResizing;
    };
  }
}

if (typeof window !== 'undefined') {
  window.IFrameResizing = {
    init: initIFrameResizing,
    autoInit: autoInitIFrameResizing,
  };
}
