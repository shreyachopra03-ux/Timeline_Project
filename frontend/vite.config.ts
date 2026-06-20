import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    historyApiFallback: true,
    proxy: {
      '/media': 'http://localhost:7777',
      '/clips': 'http://localhost:7777',
      '/shared': 'http://localhost:7777',
    }
  }
})
