import { getValues, PartialRecord } from '../typescript-tools'
import { isTitreStatutId, isTitreValide, TitresStatutIds, TitreStatutId } from './titresStatuts'
import { test, expect } from 'vitest'

test('isTitreStatutId', () => {
  expect(isTitreStatutId('plop')).toBe(false)
  expect(isTitreStatutId('dmc')).toBe(true)
})

test('isTitreValide', () => {
  expect(
    getValues(TitresStatutIds).reduce<PartialRecord<TitreStatutId, boolean>>((acc, titreStatutId) => {
      acc[titreStatutId] = isTitreValide(titreStatutId)

      return acc
    }, {})
  ).toMatchInlineSnapshot(`
    {
      "dmc": false,
      "dmi": false,
      "ech": false,
      "ind": false,
      "mod": true,
      "sup": true,
      "val": true,
    }
  `)
})
