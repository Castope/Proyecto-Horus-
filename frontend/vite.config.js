import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolveApiBase } from './config/api-config.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = resolveApiBase(process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL, process.env.VERCEL === '1')
  return {
    plugins: [react(), tailwindcss()],
    define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBase) },
    server: {
      proxy: { '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true } },
    },
  }
})
