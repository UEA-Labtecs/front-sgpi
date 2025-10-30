import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://api-sgpi.labtecs.com.br',
        changeOrigin: true,
      },
      '/patents': {
        target: 'http://api-sgpi.labtecs.com.br',
        changeOrigin: true,
      },
    }
  }
})
