import { test, describe, expect } from 'vitest'
import { type GetUtilisateur, filterUtilisateur } from './utilisateurs.queries'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { userSuper } from '../user-super'

const userToBeFiltered: GetUtilisateur = {
  ...testBlankUser,
  telephone_fixe: 'telFixe',
  telephone_mobile: 'telMobile',
  role: 'defaut',
  administration_id: null,
  entreprise_ids: null,
}

describe('filterUtilisateur', () => {
  test('filtre les utilisateurs par administration', () => {
    const adminUser: GetUtilisateur = { ...userToBeFiltered, role: 'admin', administration_id: 'aut-97300-01' }
    expect(filterUtilisateur(userToBeFiltered, { administrationIds: ['aut-97300-01'] }, userSuper)).toBe(false)
    expect(filterUtilisateur(adminUser, { administrationIds: ['aut-97300-01'] }, userSuper)).toBe(true)
  })

  test('filtre les utilisateurs par entreprise', () => {
    const entrepriseId = entrepriseIdValidator.parse('entrepriseId')
    const entrepriseUser: GetUtilisateur = { ...userToBeFiltered, role: 'entreprise', entreprise_ids: [entrepriseId] }
    expect(filterUtilisateur(userToBeFiltered, { entreprisesIds: [entrepriseId] }, userSuper)).toBe(false)
    expect(filterUtilisateur(entrepriseUser, { entreprisesIds: [entrepriseId] }, userSuper)).toBe(true)
  })

  test('filtre les utilisateurs par role', () => {
    expect(filterUtilisateur(userToBeFiltered, { roles: ['admin'] }, userSuper)).toBe(false)
    expect(filterUtilisateur(userToBeFiltered, { roles: ['defaut'] }, userSuper)).toBe(true)
  })

  test('filtre les utilisateurs par nom (et ne prend pas en compte la casse)', () => {
    expect(filterUtilisateur(userToBeFiltered, { nomsUtilisateurs: 'camino' }, userSuper)).toBe(false)
    expect(filterUtilisateur({ ...userToBeFiltered, nom: 'don Camino' }, { nomsUtilisateurs: 'camino' }, userSuper)).toBe(true)
    expect(filterUtilisateur({ ...userToBeFiltered, prenom: 'don Camino' }, { nomsUtilisateurs: 'camino' }, userSuper)).toBe(true)
    expect(filterUtilisateur({ ...userToBeFiltered, prenom: null }, { nomsUtilisateurs: 'camino' }, userSuper)).toBe(false)
  })

  test('filtre les utilisateurs par email', () => {
    expect(filterUtilisateur(userToBeFiltered, { emails: 'camino' }, userSuper)).toBe(false)
    expect(filterUtilisateur({ ...userToBeFiltered, email: 'jean@camino.beta.gouv.fr' }, { emails: 'camino' }, userSuper)).toBe(true)
  })

  test('filtre les utilisateurs qui ne sont pas de ton administration', () => {
    expect(filterUtilisateur(userToBeFiltered, {}, { ...testBlankUser, role: 'lecteur', administrationId: 'aut-97300-01' })).toBe(false)
    expect(filterUtilisateur({ ...userToBeFiltered, role: 'admin', administration_id: 'aut-97300-01' }, {}, { ...testBlankUser, role: 'lecteur', administrationId: 'aut-97300-01' })).toBe(true)
  })

  test('filtre les utilisateurs qui ne sont pas de ton entreprise', () => {
    const entrepriseId = entrepriseIdValidator.parse('entrepriseId')
    expect(filterUtilisateur(userToBeFiltered, {}, { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseId }] })).toBe(false)
    expect(filterUtilisateur({ ...userToBeFiltered, role: 'entreprise', entreprise_ids: [entrepriseId] }, {}, { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseId }] })).toBe(true)
  })
})
