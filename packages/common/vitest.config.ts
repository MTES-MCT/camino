/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      enabled: true,
      extension: '.ts',
      thresholds: {
        // the endgame is to put thresholds at 100 and never touch it again :)
        autoUpdate: true,
        branches: 91.01,
        functions: 83.46,
        lines: 96.68,
        statements: 96.68,
        perFile: false,
      },
    },
  },
})