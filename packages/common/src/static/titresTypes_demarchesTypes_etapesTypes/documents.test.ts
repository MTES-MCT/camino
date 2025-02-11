import { DEMARCHES_TYPES_IDS } from '../demarchesTypes'
import { ETAPES_TYPES } from '../etapesTypes'
import { TITRES_TYPES_IDS } from '../titresTypes'
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

test("le courrier de notification au préfet est obligatoire pour l'information du préfet et des collectivités", () => {
  expect(getDocuments(TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX, DEMARCHES_TYPES_IDS.Octroi, ETAPES_TYPES.informationDuPrefetEtDesCollectivites)).toMatchInlineSnapshot(`
    [
      {
        "id": "cnp",
        "nom": "Courrier de notification au préfet",
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
