import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AfriLingo - Learn Nigerian Languages',
        short_name: 'AfriLingo',
        description: 'Learn Nigerian languages with cultural immersion',
        theme_color: '#008751',
        background_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Cache strategies for offline support
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.spitch\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'spitch-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    // Optimize for performance
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
        }
      }
    }
  }
});