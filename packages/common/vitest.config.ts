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
        branches: 92.21,
        functions: 85.54,
        lines: 97.29,
        statements: 97.29,
        perFile: false,
      },
    },
  },
})