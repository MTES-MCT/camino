import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.test.integration.ts'],
    threads: false,
    setupFiles: '../tests/vitestSetup.ts'
  }
})
