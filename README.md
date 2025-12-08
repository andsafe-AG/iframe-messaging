# @andsafe/iframe-resizing

A lightweight, framework-agnostic library for automatic iframe height resizing. Perfect for embedded applications that need to communicate their size to parent windows.

[![npm version](https://img.shields.io/npm/v/@andsafe/iframe-resizing.svg)](https://www.npmjs.com/package/@andsafe/iframe-resizing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/andsafe-AG/iframe-resizing/actions/workflows/ci.yml/badge.svg)](https://github.com/andsafe-AG/iframe-resizing/actions/workflows/ci.yml)
[![CodeQL](https://github.com/andsafe-AG/iframe-resizing/actions/workflows/codeql.yml/badge.svg)](https://github.com/andsafe-AG/iframe-resizing/actions/workflows/codeql.yml)
[![Coverage](https://img.shields.io/badge/coverage-97.67%25-brightgreen.svg)](./coverage)

## Features

- 📦 **Tiny Bundle Size** - Minimal dependencies, optimized for performance
- 🔄 **Automatic Resizing** - Uses ResizeObserver for efficient size monitoring
- 💬 **PostMessage Protocol** - Secure cross-origin communication
- 🎯 **TypeScript Support** - Full type definitions included
- 🌐 **Universal** - Works with vanilla JS, TypeScript, and all frameworks
- 📤 **Dual Exports** - CommonJS and ES Module support
- 🔒 **SSR Safe** - Server-side rendering compatible

## Installation

```bash
npm install @andsafe/iframe-resizing
```

```bash
yarn add @andsafe/iframe-resizing
```

```bash
pnpm add @andsafe/iframe-resizing
```

## Quick Start

### ES Modules

```typescript
import { autoInitIFrameResizing } from '@andsafe/iframe-resizing';

// Initialize with automatic DOM ready detection
const cleanup = autoInitIFrameResizing();

// Cleanup when needed (optional)
// cleanup();
```

### CommonJS

```javascript
const { autoInitIFrameResizing } = require('@andsafe/iframe-resizing');

const cleanup = autoInitIFrameResizing();
```

### Browser (UMD)

You can use the library directly in the browser without a build tool:

```html
<!-- From CDN (unpkg) -->
<script src="https://unpkg.com/@andsafe/iframe-resizing@1.3.0/dist/iframe-resizing.umd.js"></script>

<!-- Or from jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@andsafe/iframe-resizing@1.3.0/dist/iframe-resizing.umd.js"></script>

<script>
  // The library is available globally as IFrameResizing
  const cleanup = IFrameResizing.autoInit();
</script>
```

Or download and host the file yourself:

```html
<script src="path/to/iframe-resizing.umd.js"></script>
<script>
  const cleanup = IFrameResizing.autoInit({
    onError: (error) => console.error(error)
  });
</script>
```

## Usage

### Basic Usage

The simplest way to use this library is with `autoInitIFrameResizing`, which handles DOM ready state automatically:

```typescript
import { autoInitIFrameResizing } from '@andsafe/iframe-resizing';

const cleanup = autoInitIFrameResizing();
```

### Manual Initialization

If you need more control over when initialization happens:

```typescript
import { initIFrameResizing } from '@andsafe/iframe-resizing';

document.addEventListener('DOMContentLoaded', () => {
  const cleanup = initIFrameResizing();
});
```

### With Error Handling

```typescript
import { autoInitIFrameResizing } from '@andsafe/iframe-resizing';

const cleanup = autoInitIFrameResizing({
  onError: (error) => {
    console.error('Failed to resize iframe:', error);
  },
  captureError: (error) => {
    // Send to your monitoring service
    // Example: Sentry.captureException(error);
  }
});
```

### Cleanup

The initialization functions return a cleanup function that disconnects the ResizeObserver:

```typescript
const cleanup = autoInitIFrameResizing();

// Later, when you want to stop resizing
cleanup();

// Or cleanup on page unload
window.addEventListener('beforeunload', cleanup);
```

## API Reference

### `autoInitIFrameResizing(options?)` ⭐ Recommended

Automatically initializes iframe resizing when the DOM is ready. This is the **recommended** method for most use cases.

**Parameters:**
- `options?: IFrameResizingOptions` - Optional configuration object

**Returns:**
- `() => void` - Cleanup function to disconnect the observer

**Behavior:**
- ✅ **Smart initialization**: Checks `document.readyState`
- ✅ **If DOM is loading**: Waits for `DOMContentLoaded` event
- ✅ **If DOM is ready**: Initializes immediately
- ✅ **Safe to call anytime**: Works even if called before DOM is ready

**When to use:**
- **Always**, unless you need manual control over timing
- In module scripts loaded at the top of the page
- When you want convenience and safety

**Example:**
```typescript
// Can be called anywhere - handles DOM ready state automatically
const cleanup = autoInitIFrameResizing({
  onError: (error) => console.error(error)
});
```

### `initIFrameResizing(options?)`

Initializes iframe resizing **immediately**. The DOM **must be ready** before calling this.

**Parameters:**
- `options?: IFrameResizingOptions` - Optional configuration object

**Returns:**
- `() => void` - Cleanup function to disconnect the observer

**Behavior:**
- ⚠️ **Immediate initialization**: No DOM ready check
- ⚠️ **Assumes documentElement exists**: Will log warning if `document.documentElement` is not available
- ⚠️ **Timing matters**: Must be called after DOM is loaded

**When to use:**
- When you need **manual control** over initialization timing
- Inside a `DOMContentLoaded` event handler
- In scripts with `defer` attribute where DOM is guaranteed to be ready
- In frameworks that handle DOM ready state for you

**Example:**
```typescript
// Only call after you know DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const cleanup = initIFrameResizing();
});
```

### Function Comparison

| Feature | `autoInitIFrameResizing` | `initIFrameResizing` |
|---------|-------------------------|----------------------|
| **DOM Ready Check** | ✅ Automatic | ❌ Manual (your responsibility) |
| **Safe Early Call** | ✅ Yes | ❌ No (may fail) |
| **Waits for DOM** | ✅ If needed | ❌ Never waits |
| **Convenience** | ✅ High | ⚠️ Medium |
| **Use Case** | General purpose | Manual control |
| **Recommended** | ✅ Yes | Only if needed |

### `IFrameResizingOptions`

Configuration options for iframe resizing.

```typescript
interface IFrameResizingOptions {
  /**
   * Error callback function called when resize command fails
   */
  onError?: (error: Error) => void;

  /**
   * Error capture function for monitoring/logging services
   */
  captureError?: (error: Error) => void;
}
```

## How It Works

1. **ResizeObserver** - Creates a ResizeObserver that monitors the document documentElement for size changes
2. **Size Detection** - When the documentElement size changes, captures the new height via `contentRect`
3. **Message Passing** - Sends a `resize` command to the parent window using `postMessage`
4. **Acknowledgment** - Waits for acknowledgment from the parent window (20-second timeout)
5. **Error Handling** - Optionally calls error handlers if the resize fails

### Message Protocol

The library uses a structured message protocol:

```typescript
{
  id: string,           // Unique command ID (UUID)
  sender: 'child',      // Always 'child' for embedded content
  receiver: 'parent',   // Always 'parent' for the parent window
  name: 'resize',       // Command name
  payload: [[height]]   // The new height in pixels
}
```

## Parent Window Integration

The parent window must handle the `resize` command.:

### Vanilla JavaScript

```javascript
const iframe = document.querySelector('iframe');

window.addEventListener('message', (event) => {
  const { name, payload, id, sender } = event.data;

  if (name === 'resize' && sender === 'child') {
    const height = payload[0][0];
    iframe.style.height = `${height}px`;

    // Send acknowledgment
    event.source.postMessage({
      id: generateUUID(),
      correspondingCommandId: id,
      sender: 'parent',
      receiver: 'child',
      payload: undefined
    }, '*');
  }
});
```

## Browser Compatibility

- **ResizeObserver**: Chrome 64+, Firefox 69+, Safari 13.1+, Edge 79+
- **postMessage**: Universal support
- **UUID**: Requires the `uuid` package (included as dependency)

For older browsers, consider adding a [ResizeObserver polyfill](https://github.com/que-etc/resize-observer-polyfill).

## Use Cases

### 1. Embedded Forms

Perfect for embedding forms in legacy applications:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Registration Form</title>
  <script type="module">
    import { autoInitIFrameResizing } from '@andsafe/iframe-resizing';
    autoInitIFrameResizing();
  </script>
</head>
<body>
  <form id="registration">
    <!-- form fields -->
  </form>
</body>
</html>
```

### 2. Dynamic Content

Automatically resize as content changes:

```typescript
import { autoInitIFrameResizing } from '@andsafe/iframe-resizing';

// Initialize resizing
autoInitIFrameResizing();

// Content changes are automatically detected
function addContent() {
  const element = document.createElement('div');
  element.textContent = 'New content';
  document.documentElement.appendChild(element);
  // Resize happens automatically!
}
```

### 3. Single Page Applications

```typescript
import { initIFrameResizing } from '@andsafe/iframe-resizing';

class MyApp {
  private resizeCleanup?: () => void;

  init() {
    this.resizeCleanup = initIFrameResizing({
      captureError: (error) => this.logger.error(error)
    });
  }

  destroy() {
    this.resizeCleanup?.();
  }
}
```

## TypeScript

Full TypeScript support with type definitions:

```typescript
import type {
  IFrameResizingOptions,
  Participant,
  Command,
  CommandResponse
} from '@andsafe/iframe-resizing';

const options: IFrameResizingOptions = {
  onError: (error: Error) => console.error(error),
  captureError: (error: Error) => Sentry.captureException(error)
};
```

## Troubleshooting

### Resize Not Working

1. **Check iframe detection**: Ensure your code is running inside an iframe
2. **Verify parent handler**: Confirm the parent window has a handler for `resize` commands
3. **Console errors**: Check browser console for warnings or errors
4. **Cross-origin**: Verify `postMessage` is allowed between origins

### Performance Issues

If experiencing frequent resize events:

1. **Content optimization**: Minimize layout thrashing in your application
2. **ResizeObserver debouncing**: The ResizeObserver API naturally debounces events
3. **Monitor timeouts**: Check if resize commands are timing out (20s limit)

### TypeScript Errors

Ensure you're importing types correctly:

```typescript
import type { IFrameResizingOptions } from '@andsafe/iframe-resizing';
```

## Package Exports

This package provides both CommonJS and ES Module builds:

```json
{
  "main": "./dist/iframe-resizing.cjs",
  "module": "./dist/iframe-resizing.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/iframe-resizing.js",
      "require": "./dist/iframe-resizing.cjs"
    }
  }
}
```

## Testing

This library has comprehensive test coverage using Vitest:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

**Coverage**: 97.67% statements, 96.42% branches, 100% functions

For detailed testing documentation, see [TESTING.md](./TESTING.md).

## Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
# Check code quality
npm run check

# Auto-fix issues
npm run check:fix

# Lint only
npm run lint

# Format only
npm run format:fix
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Run example server
npm run server
```

## License

MIT © andsafe AG

## Support

For issues and questions, please [open an issue](https://github.com/andsafe-AG/iframe-resizing/issues) on GitHub.
