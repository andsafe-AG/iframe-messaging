# Project Structure

This document provides an overview of the `@andsafe/iframe-messaging` package structure.

## Directory Structure

```
iframe-messaging/
├── src/                          # Source files (TypeScript)
│   ├── __tests__/                # Test files
│   │   ├── setup.ts              # Test environment configuration
│   │   ├── datalayer-push.test.ts
│   │   ├── iframe-resizing.test.ts
│   │   ├── send-command.test.ts
│   │   ├── types.test.ts
│   │   └── utils.test.ts
│   ├── index.ts                  # Main entry point and exports
│   ├── iframe-resizing.ts        # Core resizing implementation
│   ├── datalayer-push.ts         # Data layer integration
│   ├── send-command.ts           # postMessage command logic
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Shared utilities
│
├── dist/                         # Build output (generated)
│   ├── iframe-messaging.js       # ES Module build
│   ├── iframe-messaging.cjs      # CommonJS build
│   ├── iframe-messaging.umd.js   # UMD build (browser globals)
│   ├── iframe-messaging.d.ts     # TypeScript declarations (main)
│   ├── index.d.ts                # TypeScript declarations (entry)
│   ├── types.d.ts                # TypeScript declarations (types)
│   └── *.map                     # Source maps
│
├── examples/                     # Usage examples
│   ├── server.js                 # Local development server
│   ├── vanilla-js.html           # Vanilla JavaScript example (child window)
│   ├── typescript.ts             # TypeScript usage examples
│   ├── parent-window.html        # Parent window implementation example
│   ├── parent-child-demo.html    # Combined parent+child demo
│   ├── browser-standalone.html   # Standalone browser usage example
│   └── test-iframe.html          # IFrame test helper
│
├── package.json                  # Package configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite build configuration
├── vitest.config.ts              # Vitest test configuration
├── biome.json                    # Biome linter/formatter configuration
│
├── README.md                     # Main documentation
├── CHANGELOG.md                  # Version history
├── CONTRIBUTING.md               # Contribution guidelines
├── GETTING_STARTED.md            # Quick-start guide
├── LICENSE                       # MIT License
├── PROJECT_STRUCTURE.md          # This file
│
├── .gitignore                    # Git ignore rules
└── .npmignore                    # NPM publish ignore rules
```

## Source Files

### `src/index.ts`
Main entry point for the package. Exports all public APIs and types.

**Exports:**
- `initIFrameResizing` - Manual initialization function
- `autoInitIFrameResizing` - Auto-init with DOM ready detection
- `pushToDataLayer` - Push events to parent data layer
- `IFrameResizingOptions` - Resizing configuration type
- `IFrameCommandOptions` - Base command options type
- `Participant` - Participant type
- `Command` - Command structure type
- `CommandResponse` - Response structure type
- `participants` - Participant constants

### `src/iframe-resizing.ts`
Core implementation of the iframe resizing functionality.

**Key Components:**
- `initIFrameResizing()` - Main initialization function; sets up a ResizeObserver and sends resize commands to the parent
- `autoInitIFrameResizing()` - Convenience wrapper that waits for DOM ready before calling `initIFrameResizing`

### `src/datalayer-push.ts`
Data layer integration for pushing analytics events from within an iframe to the parent window.

**Exports:**
- `pushToDataLayer()` - Sends a `pushToDataLayer` command with an event object to the parent window

### `src/send-command.ts`
Low-level postMessage command abstraction used internally.

**Exports (internal):**
- `sendCommand()` - Sends a named command with a payload to the parent window and awaits acknowledgment

### `src/types.ts`
TypeScript type definitions and constants.

**Exports:**
- `participants` - Constant object with `PARENT` and `CHILD` values
- `Participant` - Type for participants
- `Command` - Message command structure
- `CommandResponse` - Message response structure
- `IFrameCommandOptions` - Base options (error callbacks)
- `IFrameResizingOptions` - Resizing-specific options (extends `IFrameCommandOptions`)

### `src/utils.ts`
Shared utility functions used internally across the package.

**Exports (internal):**
- `isServerSide()` - Returns `true` when running in a server-side (non-browser) environment
- `isInIframe()` - Returns `true` when running inside an iframe

## Build Output

The build process (via Vite) generates:

1. **ES Module** (`iframe-messaging.js`)
   - For modern bundlers and browsers
   - Tree-shakeable
   - ~1.7KB (uncompressed), ~0.8KB gzipped

2. **CommonJS** (`iframe-messaging.cjs`)
   - For Node.js and older bundlers
   - Requires Node.js or bundler
   - ~1.4KB (uncompressed), ~0.76KB gzipped

3. **UMD** (`iframe-messaging.umd.js`)
   - Universal Module Definition for direct browser `<script>` usage
   - Exposes `IFrameMessaging` global

4. **Type Declarations** (`*.d.ts`)
   - Full TypeScript support
   - Includes type maps for IDE navigation

4. **Source Maps** (`*.map`)
   - For debugging
   - Maps compiled code back to source

## Examples

### `examples/vanilla-js.html`
A working child-window example showing basic library initialization, dynamic content, error handling, and cleanup.

### `examples/typescript.ts`
TypeScript examples demonstrating basic usage, error handling, manual initialization, and class-based usage.

### `examples/parent-window.html`
Parent window implementation showing how to receive resize messages, send acknowledgments, and adjust iframe height.

### `examples/parent-child-demo.html`
Combined demo with both parent and child embedded on the same page for quick local testing.

### `examples/browser-standalone.html`
Shows direct browser usage without a bundler (CDN / script-tag style).

### `examples/test-iframe.html`
Minimal iframe used as a target when testing the parent window examples.

### `examples/server.js`
Express-based local development server that serves all example files.

## Configuration Files

### `package.json`
- Package metadata and dependencies
- Build scripts
- Module format exports configuration (`import` → `iframe-messaging.js`, `require` → `iframe-messaging.cjs`)
- Publishing configuration

### `tsconfig.json`
- TypeScript compiler options
- Strict mode enabled
- ES2020 target
- Declaration generation

### `vite.config.ts`
- Vite build configuration
- Library mode setup
- Multiple output formats (ES + CJS)
- Type declaration generation via vite-plugin-dts

### `vitest.config.ts`
- Vitest test configuration
- happy-dom environment
- Coverage thresholds (statements/lines ≥95%, branches ≥90%, functions 100%)
- Coverage exclusions for type/re-export files

### `biome.json`
- Biome linter and formatter configuration
- Single-quote style, 2-space indentation, 100-char line width
- Git VCS integration

### `.npmignore`
Files excluded from npm package:
- Source files (`.ts`)
- Development configs
- Examples (optional)
- Documentation source

### `.gitignore`
Files excluded from git:
- `node_modules/`
- `dist/`
- Build artifacts
- IDE files
- OS files

## Development Workflow

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

### Linting & Formatting
```bash
npm run check        # Check all Biome rules
npm run check:fix    # Auto-fix all Biome issues
npm run lint         # Lint only
npm run format:fix   # Format only
```

### Testing
```bash
npm test             # Watch mode
npm run test:run     # Run once
npm run test:coverage  # With coverage report
```

### Building
```bash
npm run build
```

### Publishing
```bash
npm publish
```

The `prepublishOnly` script automatically runs the build before publishing.

## Package Exports

The package uses modern package.json exports field:

```json
{
  "exports": {
    ".": {
      "import": "./dist/iframe-messaging.js",
      "require": "./dist/iframe-messaging.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

This provides:
- Automatic format selection based on consumer
- TypeScript type support
- Future-proof export mapping

## Dependencies

### Runtime
- `uuid@^9.0.1` - UUID generation for command IDs

### Development
- `typescript@^5.3.3` - TypeScript compiler
- `vite@^5.0.8` - Build tool
- `vite-plugin-dts@^3.7.0` - TypeScript declaration generation

## Browser Compatibility

- **Core Features**: All modern browsers (Chrome 64+, Firefox 69+, Safari 13.1+)
- **ResizeObserver**: Required, polyfill available for older browsers
- **postMessage**: Universal support
- **ES Modules**: Modern browsers and bundlers
- **CommonJS**: Node.js and all bundlers

## Bundle Size

| Format | Uncompressed | Gzipped |
|--------|-------------|---------|
| ES Module | 1.71 KB | 0.80 KB |
| CommonJS | 1.41 KB | 0.76 KB |

Very lightweight with minimal overhead!

## Publishing Checklist

Before publishing to npm:

1. ✅ Update version in `package.json`
2. ✅ Update `CHANGELOG.md`
3. ✅ Run `npm run type-check`
4. ✅ Run `npm run build`
5. ✅ Test in example applications
6. ✅ Review `dist/` output
7. ✅ Commit changes
8. ✅ Create git tag
9. ✅ Run `npm publish`
10. ✅ Push to repository with tags

## Testing the Package Locally

To test the package before publishing:

```bash
# In the package directory
npm pack

# This creates a .tgz file
# In your test project
npm install /path/to/andsafe-iframe-messaging-1.0.0.tgz
```

Or use npm link:

```bash
# In the package directory
npm link

# In your test project
npm link @andsafe/iframe-messaging
```

## Future Enhancements

Potential improvements for future versions:

- [ ] Add CI/CD pipeline
- [ ] Add ResizeObserver polyfill option
- [ ] Add width monitoring option
- [ ] Add retry logic for failed messages
- [ ] Add message queue for multiple resizes
