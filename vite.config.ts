import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

const isAnalyze = process.env.ANALYZE === 'true'
const plugins = [
  react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico'],
    manifest: {
      name: 'Convergence Habit Blueprints',
      short_name: 'Convergence',
      description: 'Create, track, and optimize habit blueprints on mobile.',
      theme_color: '#020617',
      background_color: '#000000',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/favicon.ico',
          sizes: '64x64 32x32 24x24 16x16',
          type: 'image/x-icon',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
      navigateFallback: '/index.html',
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache-v1',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 30,
            },
            cacheableResponse: {
              statuses: [200],
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache-v1',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources-v1',
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
    },
  }),
]

if (isAnalyze) {
  plugins.push(
    visualizer({
      filename: 'dist/bundle-stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
    })
  )
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  server: {
    host: 'localhost',  // ← Add this
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },  
})
