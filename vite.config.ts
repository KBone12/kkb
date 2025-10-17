import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'KKB - K\'s Kakeibo',
        short_name: 'KKB',
        description: 'Double-entry bookkeeping household budget application',
        theme_color: '#ffffff',
      },
    }),
  ],
})
