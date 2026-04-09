/**
 * TypeScript Example
 *
 * This example demonstrates how to use the iframe resizing library
 * in a TypeScript application.
 */

import {
  autoInitIFrameResizing,
  type IFrameResizingOptions,
  initIFrameResizing,
} from '@andsafe/iframe-messaging';

// Example 1: Basic usage
function basicExample() {
  const cleanup = autoInitIFrameResizing();

  // Cleanup when navigating away
  window.addEventListener('beforeunload', cleanup);
}

// Example 2: With error handling
function errorHandlingExample() {
  const options: IFrameResizingOptions = {
    onError: (error: Error) => {
      // Show user-friendly error message
      showErrorToast(error.message);
    },
    captureError: (_error: Error) => {
      // Send to monitoring service
      // Sentry.captureException(error);
    },
  };

  const cleanup = autoInitIFrameResizing(options);

  return cleanup;
}

// Example 3: Manual initialization
function manualExample() {
  // Wait for custom event or specific condition
  document.addEventListener('DOMContentLoaded', () => {
    const cleanup = initIFrameResizing({
      onError: (_error) => {},
    });

    // Store cleanup for later use
    (window as Window & { iframeResizeCleanup?: () => void }).iframeResizeCleanup = cleanup;
  });
}

// Example 4: Class-based usage
class MyApplication {
  private resizeCleanup?: () => void;

  init() {
    this.resizeCleanup = autoInitIFrameResizing({
      onError: (error) => this.handleError(error),
      captureError: (error) => this.logError(error),
    });
  }

  private handleError(_error: Error) {
    // Handle error in your application
  }

  private logError(_error: Error) {}

  destroy() {
    if (this.resizeCleanup) {
      this.resizeCleanup();
      this.resizeCleanup = undefined;
    }
  }
}

// Example 5: Dynamic content application
class DynamicContentApp {
  private cleanup?: () => void;

  async init() {
    // Initialize resizing
    this.cleanup = autoInitIFrameResizing();

    // Load dynamic content
    await this.loadContent();
  }

  async loadContent() {
    // Simulate loading content
    const response = await fetch('/api/content');
    const data = await response.json();

    // Add content to DOM
    const container = document.getElementById('content');
    if (container) {
      container.innerHTML = data.html;
      // Resize happens automatically!
    }
  }

  addMoreContent() {
    const newElement = document.createElement('div');
    newElement.textContent = 'New content';
    document.body.appendChild(newElement);
    // Resize happens automatically!
  }

  dispose() {
    this.cleanup?.();
  }
}

// Example 6: Conditional initialization
function conditionalExample() {
  // Only initialize if in iframe
  if (window.self !== window.top) {
    return autoInitIFrameResizing();
  }
  return () => {}; // No-op cleanup
}

// Helper function (not part of the library)
function showErrorToast(message: string) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 16px;
    border-radius: 4px;
    z-index: 9999;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 5000);
}

// Export examples for use in other modules
export {
  basicExample,
  errorHandlingExample,
  manualExample,
  MyApplication,
  DynamicContentApp,
  conditionalExample,
};
