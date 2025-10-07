import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
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
