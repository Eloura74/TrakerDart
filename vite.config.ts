import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// Configuration Vite pour l'application TrakerDart
// Optimisée pour le mobile-first et PWA
export default defineConfig({
  plugins: [
    react(),
    // Configuration PWA pour une utilisation offline et installation sur mobile
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'TrakerDart - Analyse de lancer',
        short_name: 'TrakerDart',
        description: 'Analyse biomécanique du lancer de fléchettes par webcam',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache des assets pour performance offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tensorflow-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    // Mapping des chemins pour imports simplifiés (@/...)
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Optimisations pour les performances mobile
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparation des chunks pour optimiser le chargement
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'tensorflow': ['@tensorflow/tfjs-core', '@tensorflow/tfjs-backend-webgl', '@tensorflow-models/pose-detection'],
          'ui': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-tabs']
        }
      }
    }
  },
  server: {
    // Configuration serveur de dev
    port: 3000,
    host: true // Permet l'accès depuis le réseau local (test mobile)
  }
})
