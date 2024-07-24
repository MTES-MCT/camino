import { getSecteurMaritime } from './facades'
import { test, expect } from 'vitest'

test('getSecteurMaritime', () => {
  expect(getSecteurMaritime(43)).toEqual('Riviera')
})
