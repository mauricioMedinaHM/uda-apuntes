import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin para excluir la carpeta api/ del procesamiento de módulos (solo imports, no peticiones HTTP)
const excludeApiPlugin = () => {
  return {
    name: 'exclude-api',
    enforce: 'pre',
    resolveId(id, importer) {
      // Solo interceptar imports de módulos, NO peticiones HTTP (que empiezan con / o http)
      // Si es un import de módulo (no HTTP) y está en api/, excluirlo
      if (id && !id.startsWith('/') && !id.startsWith('http') && !id.startsWith('https')) {
        if (id.includes('/api/') || id.includes('\\api\\') || id.startsWith('./api/') || id.startsWith('../api/')) {
          return { id: id, external: true }
        }
      }
      // Si el importador está en api/, también excluirlo (solo para imports de módulos)
      if (importer && !id.startsWith('/') && !id.startsWith('http') && !id.startsWith('https')) {
        if (importer.includes('/api/') || importer.includes('\\api\\')) {
          return { id: id, external: true }
        }
      }
      return null
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), excludeApiPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['@heroicons/react']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild'
  },
  server: {
    port: 3003,
    host: true,
    historyApiFallback: true,
    // Proxy para redirigir /api/* al servidor Express en desarrollo
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    },
    // Excluir la carpeta api/ del escaneo de Vite
    fs: {
      deny: ['.git', '**/api/**']
    },
    // Excluir archivos de api/ del watch
    watch: {
      ignored: ['**/api/**']
    }
  },
  preview: {
    port: 3003,
    host: true,
    historyApiFallback: true
  },
  // Excluir @aws-sdk del procesamiento del frontend
  optimizeDeps: {
    exclude: ['@aws-sdk/client-s3']
  },
  // Excluir la carpeta api/ del procesamiento
  publicDir: 'public'
})
