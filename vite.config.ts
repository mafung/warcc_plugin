import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    https: {
      key: './key.pem',
      cert: './cert.pem'
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
})
