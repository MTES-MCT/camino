import { newDateFormated } from './logger.js'
import { test, expect } from 'vitest'
test('newDateFormated', () => {
  expect(newDateFormated(new Date('2020-06-02T13:35:11.366Z'))).toMatchInlineSnapshot(`"2020-06-02 13:35:11"`)
  expect(newDateFormated(new Date('2020-06-02T01:02:03.123Z'))).toMatchInlineSnapshot(`"2020-06-02 01:02:03"`)
})
