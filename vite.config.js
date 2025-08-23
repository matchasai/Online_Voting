import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Make sure to set VITE_API_URL in your .env file, e.g.:
  // VITE_API_URL=https://your-production-api-url.com
  // For local dev, use http://localhost:5000
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
