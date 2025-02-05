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
    port: 5175,
    watch: {
      usePolling: true
    },
    proxy: {
      '/socket.io': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('WebSocket proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received response:', proxyRes.statusCode, req.url);
          });
          proxy.on('upgrade', (_req, socket, head) => {
            console.log('WebSocket connection upgraded');
            socket.on('error', (err: Error) => {
              console.log('WebSocket socket error:', err);
            });
          });
        }
      },
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying API request:', req.method, req.url);
            // Add CORS headers
            proxyReq.setHeader('Access-Control-Allow-Origin', '*');
            proxyReq.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
            proxyReq.setHeader('Access-Control-Allow-Credentials', 'true');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received API response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets'
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
})
