import { test, expect } from 'vitest'
import { getAdministrationsLocales } from './administrations'
import { communeIdValidator } from './static/communes'

test('getAdministrationsLocales', () => {
  expect(getAdministrationsLocales([], [])).toStrictEqual([])
  expect(() => getAdministrationsLocales(null, [])).toThrowErrorMatchingInlineSnapshot(`[Error: les communes ne sont pas chargées]`)
  expect(getAdministrationsLocales([], ['Baie de Bourgneuf et littoral vendéen'])).toMatchInlineSnapshot(`
    [
      "dre-pays-de-la-loire-01",
      "pre-44109-01",
      "pre-85191-01",
    ]
  `)

  expect(getAdministrationsLocales([communeIdValidator.parse('97300')], ['Baie de Bourgneuf et littoral vendéen'])).toMatchInlineSnapshot(`
    [
      "dea-guyane-01",
      "dre-pays-de-la-loire-01",
      "aut-mrae-guyane-01",
      "ope-onf-973-01",
      "pre-97302-01",
      "pre-44109-01",
      "pre-85191-01",
    ]
  `)
})
