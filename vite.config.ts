import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {  
    cors: true,
    proxy: {
      '/api': {
        target: "https://openapi-dev.swapflow.io",
        changeOrigin: true,
        secure: true, // 强制代理使用HTTPS
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    } 
  },
  preview: {  
    cors: true, 
    allowedHosts: ['openapi-dev.swapflow.io']
  }
})
