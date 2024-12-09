import { defineWorkspace } from 'vitest/config'
import path from 'path'
import { testEnv } from './test-env'

export default defineWorkspace([
  {
    test: {
      setupFiles: path.resolve(__dirname, './tests/vitestSetup.ts'),
      env: testEnv,
      environment: 'node',
      root: 'src',
      name: 'unit',
    },
  },
  {
    test: {
      name: 'integration',
      include: ['**/*.test.integration.ts'],
      setupFiles: path.resolve(__dirname, './tests/vitestSetup.ts'),
      testTimeout: 10000,
      hookTimeout: 45000,
      env: testEnv,
    },
  },
])
