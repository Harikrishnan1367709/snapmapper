import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
 
  build: {
    outDir: 'dist',
  },

  plugins: [react()],
  
  define: {
    'process.env': {},
  },
  server: {
    port: 8080
  },
  

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
