import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Fix for packages that might have resolution issues
      '@': '/src'
    }
  },
  optimizeDeps: {
    // Include problematic dependencies
    include: ['@google/generative-ai']
  },
  build: {
    // Handle external dependencies
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'ai-vendor': ['@google/generative-ai']
        }
      }
    }
  }
});