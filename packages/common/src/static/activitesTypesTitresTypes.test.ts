import { canHaveActivites } from './activitesTypesTitresTypes.js'
import { test, expect } from 'vitest'
import { TitreTypeId, TitresTypesIds } from './titresTypes.js'

test('canHaveActivites', () => {
  expect(
    TitresTypesIds.reduce<{ [key in TitreTypeId]?: boolean }>((acc, titreTypeId) => {
      acc[titreTypeId] = canHaveActivites(titreTypeId)

      return acc
    }, {})
  ).toMatchInlineSnapshot(`
    {
      "apc": false,
      "aph": false,
      "apm": false,
      "apw": false,
      "arc": false,
      "arg": false,
      "arm": false,
      "axm": true,
      "cxf": false,
      "cxg": false,
      "cxh": false,
      "cxm": true,
      "cxr": false,
      "cxs": false,
      "cxw": true,
      "inm": false,
      "inr": false,
      "pcc": false,
      "prf": false,
      "prg": false,
      "prh": false,
      "prm": true,
      "prr": false,
      "prs": false,
      "prw": false,
      "pxf": false,
      "pxg": false,
      "pxh": false,
      "pxm": true,
      "pxr": false,
      "pxw": true,
    }
  `)
})
