import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/api\/(settings|records|analytics)/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: 'Mind Tracker Pro',
        short_name: 'MindTracker',
        description: 'Acompanhe seu estado mental e identifique gatilhos de impulsos.',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'favicon.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: 'favicon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
        ],
        shortcuts: [
          {
            name: "Novo Registro",
            short_name: "Registrar",
            description: "Abre o formulário de estado mental",
            url: "/",
            icons: [{ src: "favicon.svg", sizes: "192x192", type: 'image/svg+xml' }]
          }
        ],
        screenshots: [
          {
            src: "favicon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            form_factor: "wide"
          },
          {
            src: "favicon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            form_factor: "narrow"
          }
        ]
      }
    })
  ]
})
