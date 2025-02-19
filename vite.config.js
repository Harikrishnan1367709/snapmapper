
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  base: '/SnapLogicPlayground1/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 8080
  },
  plugins: [react()],
  
  define: {
    'process.env': {},
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
