import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.test.integration.ts'],
    threads: false,
    setupFiles: '../tests/vitestSetup.ts',
    testTimeout: 10000,
    hookTimeout: 30000,
  },
})
