import { test, expect } from 'vitest'
import { capitalize, levenshtein } from './strings'

test('capitalize', () => {
  expect(capitalize('')).toBe('')
  expect(capitalize('A')).toBe('A')
  expect(capitalize('a')).toBe('A')
  expect(capitalize('é')).toBe('É')

  expect(capitalize('bonjour à tous')).toBe('Bonjour à tous')
})

test('levenshtein', () => {
  expect(levenshtein('or', 'or')).toBe(0)
  expect(levenshtein('oru', 'or')).toBe(1)
  expect(levenshtein('port', 'or')).toBe(2)
})
