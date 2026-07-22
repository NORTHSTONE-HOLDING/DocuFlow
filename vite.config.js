import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * DocuFlow Vite config
 * - React plugin for JSX/TSX
 * - Host binding via `vite --host` (see package.json scripts)
 * - SPA history fallback for client-side routes
 * - Clean alias for `@/` imports if needed later
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: false,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
  },
  // Ensure deep links like /novy, /sablony work on refresh in preview/prod
  appType: 'spa',
});
