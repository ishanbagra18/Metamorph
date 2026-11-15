import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      }
    }
  },
  build: {
    // Strictly disable production source maps
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Strategic vendor chunk splitting to shrink JavaScript bundle sizes
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom', 'react-router'],
          'ui-icons': ['lucide-react']
        }
      }
    }
  },
  esbuild: {
    // Strip debug logs and debugger statements in production builds
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
});
