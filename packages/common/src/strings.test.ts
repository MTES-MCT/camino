import { test, expect } from 'vitest'
import { capitalize } from './strings'

test('capitalize', () => {
  expect(capitalize('')).toBe('')
  expect(capitalize('A')).toBe('A')
  expect(capitalize('a')).toBe('A')
  expect(capitalize('é')).toBe('É')

  expect(capitalize('bonjour à tous')).toBe('Bonjour à tous')
})
