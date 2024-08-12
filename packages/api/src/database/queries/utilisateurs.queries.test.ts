import { test, describe, expect } from 'vitest'
import { type GetUtilisateur, filterUtilisateur } from './utilisateurs.queries'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'

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
    expect(filterUtilisateur(userToBeFiltered, { administrationIds: ['aut-97300-01'] })).toBe(false)
    expect(filterUtilisateur(adminUser, { administrationIds: ['aut-97300-01'] })).toBe(true)
  })

  test('filtre les utilisateurs par entreprise', () => {
    const entrepriseId = entrepriseIdValidator.parse('entrepriseId')
    const entrepriseUser: GetUtilisateur = { ...userToBeFiltered, role: 'entreprise', entreprise_ids: [entrepriseId] }
    expect(filterUtilisateur(userToBeFiltered, { entreprisesIds: [entrepriseId] })).toBe(false)
    expect(filterUtilisateur(entrepriseUser, { entreprisesIds: [entrepriseId] })).toBe(true)
  })

  test('filtre les utilisateurs par role', () => {
    expect(filterUtilisateur(userToBeFiltered, { roles: ['admin'] })).toBe(false)
    expect(filterUtilisateur(userToBeFiltered, { roles: ['defaut'] })).toBe(true)
  })

  test('filtre les utilisateurs par nom (et ne prend pas en compte la casse)', () => {
    expect(filterUtilisateur(userToBeFiltered, { nomsUtilisateurs: 'camino' })).toBe(false)
    expect(filterUtilisateur({ ...userToBeFiltered, nom: 'don Camino' }, { nomsUtilisateurs: 'camino' })).toBe(true)
    expect(filterUtilisateur({ ...userToBeFiltered, prenom: 'don Camino' }, { nomsUtilisateurs: 'camino' })).toBe(true)
    expect(filterUtilisateur({ ...userToBeFiltered, prenom: null }, { nomsUtilisateurs: 'camino' })).toBe(false)
  })

  test('filtre les utilisateurs par email', () => {
    expect(filterUtilisateur(userToBeFiltered, { emails: 'camino' })).toBe(false)
    expect(filterUtilisateur({ ...userToBeFiltered, email: 'jean@camino.beta.gouv.fr' }, { emails: 'camino' })).toBe(true)
  })
})
