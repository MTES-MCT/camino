import { AdministrationId, ADMINISTRATION_IDS } from './administrations.js'
import { isAssociee, isGestionnaire, getTitreTypeIdsByAdministration } from './administrationsTitresTypes.js'
import { TitresTypesIds, TitreTypeId } from './titresTypes.js'
import { test, expect } from 'vitest'

interface AdministrationsWithTitreTypeId {
  administrationId: AdministrationId
  titreTypeId: TitreTypeId
}

const administrations: AdministrationsWithTitreTypeId[] = Object.values(ADMINISTRATION_IDS).flatMap(administrationId => TitresTypesIds.map(titreTypeId => ({ administrationId, titreTypeId })))

test.each<AdministrationId>(Object.values(ADMINISTRATION_IDS))('vérifie si l’administration %p est gestionnaire', administrationId => {
  expect(isGestionnaire(administrationId)).toMatchSnapshot()
})

test.each<AdministrationsWithTitreTypeId>(administrations)('vérifie si l’administration %p est gestionnaire', ({ administrationId, titreTypeId }) => {
  expect(isGestionnaire(administrationId, titreTypeId)).toMatchSnapshot()
})

test.each<AdministrationId>(Object.values(ADMINISTRATION_IDS))('vérifie si l’administration %p est associée', administrationId => {
  expect(isAssociee(administrationId)).toMatchSnapshot()
})

test.each<AdministrationsWithTitreTypeId>(administrations)('vérifie si l’administration %p est associée', ({ administrationId, titreTypeId }) => {
  expect(isAssociee(administrationId, titreTypeId)).toMatchSnapshot()
})

test.each<AdministrationId>(Object.values(ADMINISTRATION_IDS))('vérifie tous les droits sur les types de titre pour l’administration %p', administrationId =>
  expect(getTitreTypeIdsByAdministration(administrationId)).toMatchSnapshot()
)
