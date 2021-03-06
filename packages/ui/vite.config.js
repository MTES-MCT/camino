const dotenv = require('dotenv')
const path = require('path')
const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')
const inject = require('@rollup/plugin-inject')
const { visualizer } = require('rollup-plugin-visualizer')

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

const commitHash = process.env.GIT_SHA
  ? process.env.GIT_SHA
  : require('child_process').execSync('git rev-parse --short HEAD').toString()

module.exports = defineConfig({
  plugins: [vue(), visualizer()],
  root: 'src',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // suite à l’ajout de la lib jsondiffpatch, il faut injecter process
  // => https://github.com/avkonst/hookstate/issues/118
  define: {
    applicationVersion: JSON.stringify(commitHash),
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
