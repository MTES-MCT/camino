import { describe, expect, test } from 'vitest'
import { AdministrationId } from '../static/administrations'
import { Role } from '../roles'
import { canCreateTravaux } from './titres-demarches'

describe('canCreateTravaux', () => {
  test.each<[AdministrationId, boolean]>([
    ['dre-ile-de-france-01', false],
    ['dea-guadeloupe-01', false],
    ['min-mtes-dgec-01', false],
    ['pre-42218-01', false],
    ['ope-ptmg-973-01', false],
    ['dea-guyane-01', false]
  ])('Vérifie si le $administrationId, peut créer des travaux ($travauxCreation)', async (administrationId, travauxCreation) => {
    expect(canCreateTravaux({ role: 'admin', administrationId }, 'arm', [])).toEqual(travauxCreation)
  })

  test('La DGTM peut créer des travaux sur les AXM', () => {
    expect(canCreateTravaux({ role: 'admin', administrationId: 'dea-guyane-01' }, 'axm', [])).toEqual(true)
  })

  test.each<[Role, boolean]>([
    ['super', true],
    ['entreprise', false],
    ['defaut', false]
  ])('Vérifie si un profil $role peut créer des travaux', async (role, travauxCreation) => {
    expect(canCreateTravaux({ role, administrationId: undefined }, 'arm', [])).toEqual(travauxCreation)
  })
})
