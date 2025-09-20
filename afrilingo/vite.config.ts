import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ensure proper module resolution
      '@': '/src'
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@google/generative-ai')) {
              return 'google-ai';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
          }
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1500
  },
  optimizeDeps: {
    include: ['@google/generative-ai'],
    esbuildOptions: {
      target: 'esnext'
    }
  }
});