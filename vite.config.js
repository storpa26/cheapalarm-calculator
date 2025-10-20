import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ✅ IMPORTANT: relative URLs for chunks & css -> ./assets/...
  base: '',

  build: {
    // ✅ Write build into your theme folder (what your PHP expects)
    outDir: 'react-app',
    assetsDir: 'assets',
    manifest: true, // Generate manifest.json for WordPress integration
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.jsx'),
        // Add other entry points here if needed
        // alarm: path.resolve(__dirname, 'src/pages/AlarmPage.jsx'),
      },
    },
    emptyOutDir: false, // keep your theme files; only clears react-app/
  },

  // Dev-only proxy — fine to keep
  server: {
    proxy: {
      '/wp-json': {
        target: process.env.VITE_WP_BASE_URL || 'https://cheapalarms.com.au',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
