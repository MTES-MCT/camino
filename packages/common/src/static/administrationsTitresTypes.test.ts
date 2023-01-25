import { AdministrationId, ADMINISTRATION_IDS } from './administrations.js'
import { isAssociee, isGestionnaire, getTitreTypeIdsByAdministration } from './administrationsTitresTypes.js'
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
    result[administrationId] = isGestionnaire(administrationId)
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

test('vérifie si l’administration est associée', () => {
  const result: { [key in AdministrationId]?: boolean } = {}
  Object.values(ADMINISTRATION_IDS).forEach(administrationId => {
    result[administrationId] = isAssociee(administrationId)
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
