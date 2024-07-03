/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import dotenv from 'dotenv'
import path from 'path'
import vueJsx from '@vitejs/plugin-vue-jsx'
import inject from '@rollup/plugin-inject'
import { visualizer } from 'rollup-plugin-visualizer'
import { execSync } from 'node:child_process'
import { rollupOptions} from './vite-rollup'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

const commitHash = process.env.GIT_SHA ? process.env.GIT_SHA : execSync('git rev-parse --short HEAD').toString()

export default defineConfig({
  plugins: [vueJsx(), visualizer()],
  root: 'src',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    testTransformMode: {
      web: ['*.tsx'],
    },
    // async cjs module issue from https://github.com/vitest-dev/vitest/issues/2742
    alias: [
      { find: /^jsondiffpatch-rc$/, replacement: 'jsondiffpatch-rc/dist/jsondiffpatch.esm.js' },
    ],
  },
  // suite à l’ajout de la lib jsondiffpatch, il faut injecter process
  // => https://github.com/avkonst/hookstate/issues/118
  define: {
    applicationVersion: JSON.stringify(commitHash),
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    // mode dev
    'process.env': {},
  },
  build: {
    outDir: '../dist',
    // mode prod
    rollupOptions
  },
  server: {
    port: 3000,
    proxy: {
      '/apiUrl': {
        target: process.env.API_URL,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/apiUrl/, ''),
      },
      '/televersement': {
        target: process.env.API_URL,
        changeOrigin: true,
      },
      '/stream/version': {
        target: process.env.API_URL,
        changeOrigin: true,
        configure: (proxy, options) => {
          // fix https://github.com/http-party/node-http-proxy/issues/1520
          proxy.on('proxyRes', (proxyRes, _req, res) => {
            res.on('close', () => {
              if (!res.finished) {
                console.info('client closed http con, close proxy con')
                proxyRes.destroy()
              }
            })
          })
        },
      },
    },
  },
})
