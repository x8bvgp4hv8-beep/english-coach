import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Shown in settings, so "какая у меня сборка" is answerable without digging into hashes.
  define: { __BUILD_ID__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')) },
  // Relative base so the build also works from a subfolder on a static host.
  base: './',
  esbuild: { jsx: 'automatic' },
  build: {
    // По умолчанию Vite собирает под браузеры не старше конца 2020 года, и на всём, что
    // старше, скрипт молча падает с синтаксической ошибкой — экран остаётся пустым, без
    // единого слова о причине. Телефон, который человеку не меняли пять лет, — ровно тот
    // случай, ради которого всё это и делается. es2017 покрывает Chrome с 2018 года,
    // стоит это несколько килобайт, и ни одного нового API в приложении нет (`flatMap`
    // самый свежий, он с Chrome 69).
    target: 'es2017',
    rollupOptions: {
      output: {
        // Точки в середине имени запрещает GitVerse Pages — российское зеркало, ради
        // которого всё это и затевалось: его сборщик такие файлы молча выбрасывает.
        // Под правило попадает ровно один чанк, `workbox-window.prod.es5`, и отвечает
        // он за обновление приложения — пропав, он ломает не картинку, а саму
        // возможность довезти до человека следующее исправление.
        chunkFileNames: (chunk) => `assets/${chunk.name.replace(/\./g, '-')}-[hash].js`,
      },
    },
  },
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
        // Манифесты озвучки — по 200–500 КБ на уровень, и нужны они только при входе в
        // режим со звуком. В предзагрузке они стоили бы почти два мегабайта на запуске.
        globIgnores: ['voice/**'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Озвучка слов — 6000 файлов и 10 МБ, и в предзагрузке ей нельзя: первый запуск
        // тянул бы их все. Забирается по одному при прослушивании и остаётся офлайн.
        runtimeCaching: [
          {
            urlPattern: /\/voice\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'voice-manifests', expiration: { maxEntries: 40 } },
          },
          {
            urlPattern: /\/voice\/.*\.opus$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'voice-words',
              expiration: { maxEntries: 6500 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
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
          // Отдельный файл, а не тот же самый: Android режет maskable-иконку по своей форме,
          // и у носорога во весь кадр отрезало бы уши. В этом рисунок ужат до безопасной зоны.
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
