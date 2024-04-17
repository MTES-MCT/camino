import { expect, test } from "vitest"
import { nullToDefault } from "./zod-tools"
import { z } from "zod"



test('nullToDefault', () => {
  expect(z.string().nullable().transform(nullToDefault('inCaseOfNull')).parse(null)).toBe('inCaseOfNull')
  expect(z.string().optional().transform(nullToDefault('inCaseOfNull')).parse(undefined)).toBe('inCaseOfNull')
  expect(z.string().optional().transform(nullToDefault('inCaseOfNull')).parse('value')).toBe('value')

  const myArray: string[] = []
  expect(z.array(z.string()).nullable().transform(nullToDefault(myArray)).parse(null)).toStrictEqual([])
  expect(z.array(z.string()).optional().transform(nullToDefault(myArray)).parse(undefined)).toStrictEqual([])
  expect(z.array(z.string()).optional().transform(nullToDefault(myArray)).parse(['toto'])).toStrictEqual(['toto'])
})
