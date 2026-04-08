/**
 * Checks if code is running on server side
 * @returns true if running on server side
 * @internal
 */
export function isServerSide(): boolean {
  return typeof window === 'undefined';
}

/**
 * Checks if code is running inside an iframe
 * @returns true if running inside an iframe
 * @internal
 */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (_e) {
    // Cross-origin access throws error, but that means we're in an iframe
    return true;
  }
}
