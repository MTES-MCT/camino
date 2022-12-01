import { timeFormat } from './index.js'
import { describe, expect, test } from 'vitest'

describe('timeFormat', () => {
  test('conversion', () => {
    expect(timeFormat('9 min 47s')).toBe(9)
    expect(timeFormat('47s')).toBe(0)
  })
})
