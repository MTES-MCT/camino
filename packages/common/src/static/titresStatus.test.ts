import { isTitreStatutId } from './titresStatuts.js'
import { test, expect } from 'vitest'

test('isTitreStatutId', () => {
  expect(isTitreStatutId('plop')).toBe(false)
  expect(isTitreStatutId('dmc')).toBe(true)
})
