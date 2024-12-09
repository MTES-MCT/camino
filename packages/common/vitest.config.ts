/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'node',
    root: 'src/',
    coverage: {
      provider: 'v8',
      enabled: true,
      extension: '.ts',
      thresholds: { 100: true },
    },
  },
})
