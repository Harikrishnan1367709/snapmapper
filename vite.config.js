
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { componentTagger } from "lovable-tagger"

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  
  build: {
    outDir: 'dist',
  },

  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  define: {
    'process.env': {},
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
