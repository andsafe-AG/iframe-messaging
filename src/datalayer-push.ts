/**
 * Provides a function to push events from an iframe to the parent window's data layer.
 *
 * This module exports the {@link pushToDataLayer} function, which allows sending event objects
 * from within an iframe to the parent window using postMessage. It includes checks to ensure
 * it only runs in a browser iframe context and not on the server side, and supports error handling.
 *
 * @packageDocumentation
 */

import { sendCommand } from './send-command';
import type { IFrameCommandOptions } from './types';
import { isInIframe, isServerSide } from './utils';

/**
 * Pushes an event object to the parent window's data layer from within an iframe.
 *
 * This function checks if it is running in an iframe and not on the server side. If so, it sends a
 * 'pushToDataLayer' command with the provided event object to the parent window using postMessage.
 * Error handling callbacks can be provided via options.
 *
 * @param event - The event object to push to the data layer.
 * @param options - Optional configuration object for error handling.
 * @param options.onError - Optional callback invoked when an error occurs.
 * @param options.captureError - Optional callback for capturing errors (e.g., for logging).
 *
 * @example
 * // Basic usage:
 * pushToDataLayer({ event: 'pageView' });
 *
 * // With error handling:
 * pushToDataLayer(
 *   { event: 'purchase', value: 100 },
 *   {
 *     onError: (err) => console.error('Push failed', err),
 *     captureError: (err) => sendToMonitoring(err),
 *   }
 * );
 *
 * @public
 */
export function pushToDataLayer(
  event: Record<string, unknown>,
  options: IFrameCommandOptions = {},
) {
  const { onError, captureError } = options;

  if (isServerSide()) {
    console.warn('pushToDataLayer: Cannot initialize on server side');
    return () => {};
  }

  if (!isInIframe()) {
    console.warn('pushToDataLayer: Not running in an iframe');
    return () => {};
  }

  sendCommand('handleDataLayerEvent', [event]).catch((error) => {
    console.warn(error.message);

    if (onError) {
      onError(error);
    }

    if (captureError) {
      captureError(error);
    }
  });
}
