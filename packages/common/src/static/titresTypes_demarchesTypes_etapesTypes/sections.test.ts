import { getSections } from './sections.js'
import { test, expect } from 'vitest'

test('getSections erreurs', () => {
  expect(() => getSections()).toThrowErrorMatchingInlineSnapshot('"il manque des éléments pour trouver les sections titreTypeId: \'undefined\', demarcheId: undefined, etapeTypeId: undefined"')
})

test('getSections pas de surcharge mais pas de sections', () => {
  expect(getSections('apm', 'amo', 'abs')).toMatchInlineSnapshot('[]')
})

// ATTENTION, pour le moment il n'y a pas de surcharge (mais le code le prévoit)
// Le jour où il y'a une surcharge ajoutée, modifier ce test pour tester vraiment une surcharge
test('getSections pas de surcharge', () => {
  expect(getSections('arm', 'oct', 'rcd')).toMatchInlineSnapshot(`
    [
      {
        "elements": [
          {
            "description": "",
            "id": "mecanise",
            "nom": "Prospection mécanisée",
            "type": "radio",
          },
        ],
        "id": "arm",
        "nom": "Caractéristiques ARM",
      },
    ]
  `)
})
