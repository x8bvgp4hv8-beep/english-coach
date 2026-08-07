import { defineConfig } from 'vite'

/**
 * The component kit as a library.
 *
 * The app build (`vite.config.ts`) bundles the whole client; this one emits only
 * `src/kit/` as an ES module with React left external, which is the shape a design
 * tool can import. Types are emitted separately by `tsconfig.kit.json`.
 */
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  build: {
    outDir: 'dist-kit',
    // The .d.ts tree is already there — tsc runs first, and public/ is the app's, not the kit's.
    emptyOutDir: false,
    copyPublicDir: false,
    cssCodeSplit: false,
    lib: {
      entry: 'src/kit/index.ts',
      formats: ['es'],
      fileName: () => 'index.es.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
