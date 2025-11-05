import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path' // ✅ اضافه شد — مشکل تو از همین‌جاست

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
