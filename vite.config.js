import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Ensure Speed Insights uses the React build (not Next.js) in Vite
      '@vercel/speed-insights/next': '@vercel/speed-insights/react',
      '@vercel/speed-insights': '@vercel/speed-insights/react',
    },
  },
  optimizeDeps: {
    exclude: ['@vercel/speed-insights/next'],
  },
})
