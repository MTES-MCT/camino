import { expect, test } from 'vitest'
import { fiscaliteValidator } from './fiscalite'
import Decimal from 'decimal.js'

test('fiscaliteValidator from number', () => {
  const tested = {
    redevanceCommunale: 12,
    redevanceDepartementale: 14,
  }
  expect(fiscaliteValidator.parse(tested)).toMatchInlineSnapshot(`
    {
      "redevanceCommunale": "12",
      "redevanceDepartementale": "14",
    }
  `)
})
test('fiscaliteValidator from string', () => {
  const tested = {
    redevanceCommunale: '12',
    redevanceDepartementale: '14',
  }
  expect(fiscaliteValidator.parse(tested)).toMatchInlineSnapshot(`
    {
      "redevanceCommunale": "12",
      "redevanceDepartementale": "14",
    }
  `)
})

test('fiscaliteValidator from strange stuff', () => {
  const tested = {
    redevanceCommunale: 'NotANumber',
    redevanceDepartementale: { hello: 'general kenobi' },
  }
  expect(fiscaliteValidator.safeParse(tested)).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "message": "Not a number",
        "path": [
          "redevanceCommunale"
        ]
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [
          "redevanceCommunale"
        ]
      },
      {
        "code": "custom",
        "message": "Not a number",
        "path": [
          "redevanceDepartementale"
        ]
      },
      {
        "code": "custom",
        "message": "Invalid input",
        "path": [
          "redevanceDepartementale"
        ]
      }
    ]],
      "success": false,
    }
  `)
})

test('fiscaliteValidator from Decimal', () => {
  const tested = {
    redevanceCommunale: new Decimal(12),
    redevanceDepartementale: new Decimal(14),
  }
  expect(fiscaliteValidator.parse(tested)).toMatchInlineSnapshot(`
    {
      "redevanceCommunale": "12",
      "redevanceDepartementale": "14",
    }
  `)
})
