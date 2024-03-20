import { vi, expect, test } from 'vitest'
import { isPdf } from './file-check.js'

console.error = vi.fn()
console.info = vi.fn()

test('isPdf valide un PDF', async () => {
  expect(await isPdf('./src/tools/small.pdf')).toBe(true)
  expect(await isPdf('./src/tools/index.ts')).toBe(false)
})
