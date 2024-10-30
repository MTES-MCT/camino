import { test, expect } from 'vitest'
import { activitesFiltresNames } from './filters'

test('activitesFiltresNames', () => {
  expect(activitesFiltresNames).toMatchInlineSnapshot(`
    [
      "titresIds",
      "substancesIds",
      "domainesIds",
      "typesIds",
      "statutsIds",
      "annees",
      "entreprisesIds",
      "activiteTypesIds",
      "activiteStatutsIds",
      "references",
    ]
  `)
})
