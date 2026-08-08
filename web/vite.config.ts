import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Shown in settings, so "какая у меня сборка" is answerable without digging into hashes.
  define: { __BUILD_ID__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')) },
  // Relative base so the build also works from a subfolder on a static host.
  base: './',
  esbuild: { jsx: 'automatic' },
  plugins: [
    VitePWA({
      // 'prompt', not 'autoUpdate': the app decides WHEN to swap versions, so an update
      // can never reload the page in the middle of an exercise. See src/app/sw-update.ts.
      registerType: 'prompt',
      // The injected one-liner had no update check and no reload; we register by hand.
      injectRegister: null,
      includeAssets: ['icons/*.png'],
      // The course packs must be available offline, not just the shell.
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Workbox owns caching; push and notification clicks come from our own file.
        importScripts: ['push-sw.js'],
      },
      manifest: {
        name: 'Coachirinho',
        short_name: 'Coachirinho',
        description: 'Офлайн-тренажёр английского и испанского: короткие уроки, карточки и повторение.',
        lang: 'ru',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fbfbfd',
        theme_color: '#14121f',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
