import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno desde server/.env.local
dotenv.config({ path: path.resolve(__dirname, './server/.env.local') })

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
  // Exponer variables de entorno que empiezan con VITE_ al frontend
  define: {
    'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_CLERK_PUBLISHABLE_KEY)
  },
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
    allowedHosts: [
      'localhost',
      '.trycloudflare.com',  // Permitir túneles de Cloudflare
    ],
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
