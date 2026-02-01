
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Garante que o service-worker e manifest sejam copiados se estiverem na raiz/public
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  publicDir: 'public' // Se você mover manifest.json e service-worker.js para uma pasta 'public', eles serão copiados automaticamente.
})
