import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite roots at assets/. In dev, the Vite server (5173) serves the SPA with HMR
// and proxies API/static calls to the Phoenix app container (app:4000). A
// production `vite build` emits a hashed bundle + manifest into priv/static.
export default defineConfig({
  root: '.',
  // Serve/copy static assets (favicon, robots.txt, images/) from assets/static.
  publicDir: 'static',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Allow access via the compose service hostname (container-to-container),
    // in addition to the default localhost. Dev-only.
    allowedHosts: ['assets', 'localhost'],
    proxy: {
      '/api': { target: 'http://app:4000', changeOrigin: true },
    },
  },
  build: {
    outDir: '../priv/static',
    assetsDir: 'assets',
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
});
