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
        branches: 89.8,
        functions: 79.52,
        lines: 95.85,
        statements: 95.85,
        perFile: false,
      },
    },
  },
})
