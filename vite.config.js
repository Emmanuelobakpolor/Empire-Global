import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Same-origin API calls so Django's session and CSRF cookies work in development
    proxy: {
      // Override with API_PROXY_TARGET to point at a Django server on another port
      '/api': process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000',
    },
  },
})
