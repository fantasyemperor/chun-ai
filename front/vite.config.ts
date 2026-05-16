import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/ai': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
      '/rag': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
})
