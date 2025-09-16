import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    strictPort: false,
    proxy: {
      "/api": {
        target: "https://5000-ilobg2od14yakb95u0dob-26f1bf08.manusvm.computer",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: '../backend/src/static',
    emptyOutDir: true,
  }
})
