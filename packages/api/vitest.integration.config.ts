import { defineConfig } from 'vitest/config'
import path from 'path'
import { testEnv } from './test-env'

export default defineConfig({
  test: {
    include: ['**/*.test.integration.ts'],
    threads: false,
    setupFiles: path.resolve(__dirname, './tests/vitestSetup.ts'),
    testTimeout: 10000,
    hookTimeout: 30000,
    env: testEnv,
  },
})
