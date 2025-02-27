import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: { 
    host: true, 
    strictPort: true,
    https: true,
    cors: true 
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
    https: true,
    cors: true,
    allowedHosts: ['openapi-dev.swapflow.io']
  }
})
