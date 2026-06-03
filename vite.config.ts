import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

/** 开发时支持访问 /admin，自动转到 admin.html */
function adminPathPlugin() {
  return {
    name: 'pod-admin-path',
    configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => void } }) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url ?? ''
        const pathOnly = raw.split('?')[0] ?? ''
        if (pathOnly === '/admin' || pathOnly === '/admin/') {
          const qs = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''
          req.url = `/admin.html${qs}`
        }
        next()
      })
    },
  }
}

/** Cloudflare Pages：生成 dist/admin/index.html，避免 /admin 重定向死循环 */
function adminPagesDeployPlugin() {
  return {
    name: 'pod-admin-pages-deploy',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const adminHtml = path.join(distDir, 'admin.html')
      if (!fs.existsSync(adminHtml)) return
      const adminDir = path.join(distDir, 'admin')
      fs.mkdirSync(adminDir, { recursive: true })
      fs.copyFileSync(adminHtml, path.join(adminDir, 'index.html'))
    },
  }
}

export default defineConfig({
  server: {
    open: '/',
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_PROXY ?? 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html'),
      },
    },
  },
  plugins: [
    adminPathPlugin(),
    adminPagesDeployPlugin(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
