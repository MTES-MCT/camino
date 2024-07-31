import { fiscaliteVisible, fraisGestion } from './fiscalite'
import { UserNotNull, toUtilisateurId } from './roles'
import { CommonRestTitre } from './titres'
import { test, expect } from 'vitest'
import { newEntrepriseId } from './entreprise'
import { Decimal } from 'decimal.js'

test('fraisGestion', () => {
  expect(fraisGestion({ redevanceDepartementale: new Decimal(50), redevanceCommunale: new Decimal(50) })).toEqual(new Decimal(8))
  expect(
    fraisGestion({
      redevanceDepartementale: new Decimal(50),
      redevanceCommunale: new Decimal(50),
      guyane: {
        taxeAurifere: new Decimal(100),
        taxeAurifereBrute: new Decimal(0),
        totalInvestissementsDeduits: new Decimal(0),
      },
    })
  ).toEqual(new Decimal(16))

  expect(fraisGestion({ redevanceDepartementale: new Decimal(12.5), redevanceCommunale: new Decimal(13.2) })).toEqual(new Decimal(2.06))
})
const roleLessUser: Omit<UserNotNull, 'role'> = { id: toUtilisateurId('id'), nom: 'nom', email: 'email', prenom: 'prenom', telephone_fixe: null, telephone_mobile: null }

test('fiscaliteVisible', () => {
  const titres: Partial<Pick<CommonRestTitre, 'type_id'>>[] = [{ type_id: 'arm' }, { type_id: 'prw' }]
  expect(fiscaliteVisible(null, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible(undefined, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible({ role: 'defaut', ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible({ role: 'bureau d’études', entrepriseIds: [], ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible({ role: 'entreprise', entrepriseIds: [], ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible({ role: 'entreprise', entrepriseIds: [newEntrepriseId('1')], ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible({ role: 'entreprise', entrepriseIds: [newEntrepriseId('1234')], ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(true)
  expect(
    fiscaliteVisible(
      {
        role: 'entreprise',
        entrepriseIds: [newEntrepriseId('1'), newEntrepriseId('1234')],
        ...roleLessUser,
      },
      newEntrepriseId('1234'),
      titres
    )
  ).toBe(true)
  expect(fiscaliteVisible({ role: 'admin', administrationId: 'aut-97300-01', ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(true)
  expect(fiscaliteVisible({ role: 'editeur', administrationId: 'aut-97300-01', ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(true)
  expect(fiscaliteVisible({ role: 'lecteur', administrationId: 'aut-97300-01', ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(true)
  expect(fiscaliteVisible({ role: 'super', ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(true)
})

test('fiscaliteVisible avec les titres', () => {
  expect(fiscaliteVisible({ role: 'super', ...roleLessUser }, newEntrepriseId('1234'), [{ type_id: 'arm' }, { type_id: 'prw' }])).toEqual(true)
  expect(
    fiscaliteVisible({ role: 'entreprise', entrepriseIds: [newEntrepriseId('1234')], ...roleLessUser }, newEntrepriseId('1234'), [
      { type_id: 'prg' },
      { type_id: 'prr' },
      { type_id: 'prs' },
      { type_id: 'prw' },
    ])
  ).toEqual(false)
  expect(fiscaliteVisible({ role: 'entreprise', entrepriseIds: [newEntrepriseId('1234')], ...roleLessUser }, newEntrepriseId('1234'), [])).toEqual(false)
  expect(fiscaliteVisible({ role: 'super', ...roleLessUser }, newEntrepriseId('1234'), [{}])).toBe(false)
})
