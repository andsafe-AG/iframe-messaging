import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IFrameMessaging',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'iframe-messaging.js';
        if (format === 'cjs') return 'iframe-messaging.cjs';
        if (format === 'umd') return 'iframe-messaging.umd.js';
        return `iframe-messaging.${format}.js`;
      },
    },
    rollupOptions: {
      output: {
        // Preserve export names
        exports: 'named',
      },
    },
    sourcemap: true,
    // Emit declaration files
    emptyOutDir: true,
  },
});
