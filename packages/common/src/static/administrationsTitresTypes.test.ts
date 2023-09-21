import { AdministrationId, ADMINISTRATION_IDS } from './administrations.js'
import { isAssociee, isGestionnaire, getTitreTypeIdsByAdministration, getGestionnairesByTitreTypeId } from './administrationsTitresTypes.js'
import { TitresTypesIds, TitreTypeId } from './titresTypes.js'
import { test, expect } from 'vitest'

interface AdministrationsWithTitreTypeId {
  administrationId: AdministrationId
  titreTypeId: TitreTypeId
}

const administrations: AdministrationsWithTitreTypeId[] = Object.values(ADMINISTRATION_IDS).flatMap(administrationId => TitresTypesIds.map(titreTypeId => ({ administrationId, titreTypeId })))

test('vérifie si l’administration est gestionnaire', () => {
  const result: { [key in AdministrationId]?: boolean } = {}
  Object.values(ADMINISTRATION_IDS).forEach(administrationId => {
    result[administrationId] = isGestionnaire(administrationId, null)
  })
  expect(result).toMatchSnapshot()
})

test('vérifie si l’administration est gestionnaire par rapport au titreType', () => {
  const result: { [key in AdministrationId]?: { [key in TitreTypeId]?: boolean } } = {}
  administrations.forEach(({ administrationId, titreTypeId }) => {
    ;(result[administrationId] ??= {})[titreTypeId] = isGestionnaire(administrationId, titreTypeId)
  })
  expect(result).toMatchSnapshot()
})

test('vérifie si l’administration dre-centre-val-de-loire-01 est gestionnaire par rapport au titreType', () => {
  expect(isGestionnaire('dre-centre-val-de-loire-01', 'pcc')).toBe(false)
})

test('vérifie si l’administration est associée', () => {
  const result: { [key in AdministrationId]?: boolean } = {}
  Object.values(ADMINISTRATION_IDS).forEach(administrationId => {
    result[administrationId] = isAssociee(administrationId, null)
  })
  expect(result).toMatchSnapshot()
})

test('vérifie si l’administration est associée par rapport au titreType', () => {
  const result: { [key in AdministrationId]?: { [key in TitreTypeId]?: boolean } } = {}
  administrations.forEach(({ administrationId, titreTypeId }) => {
    ;(result[administrationId] ??= {})[titreTypeId] = isAssociee(administrationId, titreTypeId)
  })
  expect(result).toMatchSnapshot()
})

test('vérifie tous les droits sur les types de titre pour l’administration', () => {
  const result: { [key in AdministrationId]?: { titreTypeId: TitreTypeId; gestionnaire: boolean; associee: boolean }[] } = {}
  Object.values(ADMINISTRATION_IDS).forEach(administrationId => {
    result[administrationId] = getTitreTypeIdsByAdministration(administrationId)
  })
  expect(result).toMatchSnapshot()
})

test("vérifie les administrations gestionnaire d'un type de titre", () => {
  const result: { [key in TitreTypeId]?: { administrationId: AdministrationId; associee: boolean }[] } = {}
  Object.values(TitresTypesIds).forEach(titreTypeId => {
    result[titreTypeId] = getGestionnairesByTitreTypeId(titreTypeId)
  })
  expect(result).toMatchSnapshot()
})
