import dotenv from 'dotenv'
import path, { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import npmPackage from './package.json'
import inject from '@rollup/plugin-inject'

dotenv.config({ path: resolve(process.cwd(), '../../.env') })

export default defineConfig({
  plugins: [vue()],
  root: 'src',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // suite à l’ajout de la lib jsondiffpatch, il faut injecter process
  // => https://github.com/avkonst/hookstate/issues/118
  define: {
    npmVersion: JSON.stringify(npmPackage.version),
    // mode dev
    'process.env': {}
  },
  build: {
    outDir: '../dist',
    // mode prod
    rollupOptions: {
      plugins: [
        inject({
          process: 'process'
        })
      ]
    }
  },
  server: {
    proxy: {
      '/apiUrl': {
        target: process.env.API_URL,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/apiUrl/, '')
      },
      '/televersement': {
        target: process.env.API_URL,
        changeOrigin: true
      }
    }
  }
})
