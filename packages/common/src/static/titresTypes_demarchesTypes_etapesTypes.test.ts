import { getDocuments } from './titresTypes_demarchesTypes_etapesTypes'
import { test, expect } from 'vitest'

test('getDocuments erreurs', () => {
  expect(() => getDocuments()).toThrowErrorMatchingInlineSnapshot(
    `"il manque des éléments pour trouver les documents domaineId: 'undefined', titreTypeType: undefined, demarcheId: undefined, etapeTypeId: undefined"`
  )
})

test('getDocuments pas de surcharge mais pas de documents', () => {
  expect(getDocuments('ap', 'm', 'amo', 'abs')).toMatchInlineSnapshot('[]')
})

test('getDocuments pas de surcharge', () => {
  expect(getDocuments('ap', 'm', 'amo', 'wfo')).toMatchInlineSnapshot(`
    [
      {
        "id": "dcl",
        "nom": "Déclaration",
        "optionnel": true,
      },
    ]
  `)
})

test('getDocuments surcharge', () => {
  expect(getDocuments('ax', 'm', 'oct', 'dae')).toMatchInlineSnapshot(`
    [
      {
        "description": undefined,
        "id": "arp",
        "nom": "Arrêté préfectoral",
        "optionnel": false,
      },
      {
        "id": "arr",
        "nom": "Arrêté",
        "optionnel": true,
      },
      {
        "id": "dep",
        "nom": "Décision cas par cas",
        "optionnel": true,
      },
      {
        "id": "let",
        "nom": "Lettre",
        "optionnel": true,
      },
      {
        "id": "ndd",
        "nom": "Notification de décision",
        "optionnel": true,
      },
    ]
  `)

  expect(getDocuments('ax', 'm', 'oct', 'mfr')).toMatchSnapshot()

  expect(getDocuments('ax', 'm', 'oct', 'dae')).not.toEqual(getDocuments('ax', 'm', 'ces', 'dae'))
})
