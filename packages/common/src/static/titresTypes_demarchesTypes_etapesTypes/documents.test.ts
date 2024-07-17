import { ETAPES_TYPES } from '../etapesTypes.js'
import { getDocuments } from './documents.js'
import { test, expect } from 'vitest'

test('getDocuments erreurs', () => {
  expect(() => getDocuments()).toThrowErrorMatchingInlineSnapshot(`[Error: il manque des éléments pour trouver les documents titreTypeId: 'undefined', demarcheId: undefined, etapeTypeId: undefined]`)
})

test('getDocuments pas de surcharge mais pas de documents', () => {
  expect(getDocuments('apm', 'amo', 'cod')).toMatchInlineSnapshot('[]')
})

test('getDocuments pas de surcharge', () => {
  expect(getDocuments('apm', 'amo', 'wfo')).toMatchInlineSnapshot(`
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
  expect(getDocuments('axm', 'oct', 'dae')).toMatchInlineSnapshot(`
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

  expect(getDocuments('axm', 'oct', 'mfr')).toMatchSnapshot()

  expect(getDocuments('axm', 'oct', 'dae')).not.toEqual(getDocuments('axm', 'ces', 'dae'))
})

test("la lettre des saisines est obligatoire pour l'avis des services et commissions consultatives", () => {
  expect(getDocuments('prm', 'amo', ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives)).toMatchInlineSnapshot(`
    [
      {
        "id": "lcm",
        "nom": "Lettre de saisine des services civils et militaires",
        "optionnel": false,
      },
    ]
  `)
})
