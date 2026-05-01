import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['studio.touchpulse.ai', '.up.railway.app']
  },
  preview: {
    allowedHosts: ['studio.touchpulse.ai', '.up.railway.app']
  }
})
