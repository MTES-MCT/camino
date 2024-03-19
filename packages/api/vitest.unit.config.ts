import { defineConfig } from 'vitest/config'
import path from 'path'
import { testEnv } from './test-env'

export default defineConfig({
  test: {
    setupFiles: path.resolve(__dirname, './tests/vitestSetup.ts'),
    env: testEnv,
  },
})
