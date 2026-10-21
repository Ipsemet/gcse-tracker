import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// Set VITE_BASE at build time for GitHub Pages project sites (e.g. "/harry-gcse/").
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: "Harry's GCSE Command Centre",
        short_name: 'GCSE HQ',
        description: 'Spec-driven GCSE learning, testing and revision planning.',
        theme_color: '#0b0f1a',
        background_color: '#0b0f1a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Content JSON is cached at runtime so it can be refreshed without a rebuild.
        runtimeCaching: [
          {
            urlPattern: /\/content\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'gcse-content', expiration: { maxEntries: 500 } },
          },
        ],
      },
    }),
  ],
})
