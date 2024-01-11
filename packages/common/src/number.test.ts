import { test, expect } from 'vitest'
import { indexToLetter } from './number'

test('indexToLetter', () => {
  expect(indexToLetter(0)).toBe('A')
  expect(indexToLetter(1)).toBe('B')
  expect(indexToLetter(25)).toBe('Z')
  expect(indexToLetter(26)).toBe('AA')
  expect(indexToLetter(28)).toBe('AC')
  expect(indexToLetter(52)).toBe('BA')
})
