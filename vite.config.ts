import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: ['axios']
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
})
