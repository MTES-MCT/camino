// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: './coverage',
  globalSetup: './tests/setup.ts',
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: false
    }
  },
  preset: 'ts-jest',
  rootDir: './',

  roots: ['<rootDir>/src'],

  setupFilesAfterEnv: ['./tests/jest-setup.ts'],

  testEnvironment: 'node',
  testRegex: '.*test\\.ts$',
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  transformIgnorePatterns: ['/node_modules/'],
  verbose: true,
  detectOpenHandles: true,
  forceExit: true
}

export default config
