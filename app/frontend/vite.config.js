import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const segment = (env.VITE_BASE_PATH || '').replace(/^\/|\/$/g, '')
  const base = segment ? `/${segment}/` : '/'

  return {
    plugins: [react()],
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    preview: {
      host: '0.0.0.0',
      port: process.env.PORT,
      allowedHosts: ['graphlab-xbs3.onrender.com'],
    },
  }
})
