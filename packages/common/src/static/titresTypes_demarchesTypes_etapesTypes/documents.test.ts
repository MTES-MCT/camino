import { ETAPES_TYPES } from '../etapesTypes'
import { getDocuments, toDocuments } from './documents'
import { test, expect } from 'vitest'

test('toDocuments', () => {
  expect(toDocuments()).toHaveLength(212)
})

test('getDocuments erreurs', () => {
  expect(() => getDocuments()).toThrowErrorMatchingInlineSnapshot("[Error: il manque des éléments pour trouver les documents titreTypeId: 'undefined', demarcheId: undefined, etapeTypeId: undefined]")
})

test('getDocuments pas de surcharge mais pas de documents', () => {
  expect(getDocuments('apm', 'amo', 'pqr')).toMatchInlineSnapshot(`
    [
      {
        "id": "aut",
        "nom": "Autre document",
        "optionnel": true,
      },
    ]
  `)
})

test('getDocuments pas de surcharge', () => {
  expect(getDocuments('apm', 'amo', 'wfo')).toMatchInlineSnapshot(`
    [
      {
        "id": "dcl",
        "nom": "Déclaration",
        "optionnel": true,
      },
      {
        "id": "aut",
        "nom": "Autre document",
        "optionnel": true,
      },
    ]
  `)
})

test('getDocuments surcharge', () => {
  expect(getDocuments('axm', 'oct', 'mfr')).toMatchSnapshot()

  expect(getDocuments('axm', 'oct', 'mfr')).not.toEqual(getDocuments('axm', 'ces', 'mfr'))
})

test("la lettre des saisines est obligatoire pour l'avis des services et commissions consultatives", () => {
  expect(getDocuments('prm', 'amo', ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives)).toMatchInlineSnapshot(`
    [
      {
        "id": "lcm",
        "nom": "Lettre de saisine des services civils et militaires",
        "optionnel": false,
      },
      {
        "id": "aut",
        "nom": "Autre document",
        "optionnel": true,
      },
    ]
  `)
})
