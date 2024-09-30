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
        autoUpdate: false,
        branches: 92.10,
        functions: 85.88,
        lines: 97.3,
        statements: 97.3,
        perFile: false,
      },
    },
  },
})
