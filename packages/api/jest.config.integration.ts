import config from './jest.config'
config.testRegex = 'test.integration.ts$'
config.maxWorkers = 1
config.testTimeout = 20000

console.log('RUNNING INTEGRATION TESTS')
export default config
