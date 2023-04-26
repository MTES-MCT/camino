import { fiscaliteVisible, fraisGestion } from './fiscalite.js'
import { UserNotNull } from './roles.js'
import { CommonRestTitre } from './titres.js'
import { test, expect } from 'vitest'
import { newEntrepriseId } from './entreprise.js'

test('fraisGestion', () => {
  expect(fraisGestion({ redevanceDepartementale: 50, redevanceCommunale: 50 })).toBe(8)
  expect(
    fraisGestion({
      redevanceDepartementale: 50,
      redevanceCommunale: 50,
      guyane: {
        taxeAurifere: 100,
        taxeAurifereBrute: 0,
        totalInvestissementsDeduits: 0,
      },
    })
  ).toBe(16)

  expect(fraisGestion({ redevanceDepartementale: 12.5, redevanceCommunale: 13.2 })).toBe(2.06)
})
const roleLessUser: Omit<UserNotNull, 'role'> = { id: 'id', nom: 'nom', email: 'email', prenom: 'prenom' }

test('fiscaliteVisible', () => {
  const titres: Partial<Pick<CommonRestTitre, 'type_id'>>[] = [{ type_id: 'arm' }, { type_id: 'prw' }]
  expect(fiscaliteVisible(null, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible(undefined, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible({ role: 'defaut', ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible({ role: 'bureau d’études', entreprises: [], ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible({ role: 'entreprise', entreprises: [], ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible({ role: 'entreprise', entreprises: [{ id: newEntrepriseId('1') }], ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(false)
  expect(fiscaliteVisible({ role: 'entreprise', entreprises: [{ id: newEntrepriseId(newEntrepriseId('1234')) }], ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(true)
  expect(
    fiscaliteVisible({ role: 'entreprise', entreprises: [{ id: newEntrepriseId('1') }, { id: newEntrepriseId(newEntrepriseId('1234')) }], ...roleLessUser }, newEntrepriseId('1234'), titres)
  ).toBe(true)
  expect(fiscaliteVisible({ role: 'admin', administrationId: 'aut-97300-01', ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(true)
  expect(fiscaliteVisible({ role: 'editeur', administrationId: 'aut-97300-01', ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(true)
  expect(fiscaliteVisible({ role: 'lecteur', administrationId: 'aut-97300-01', ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(true)
  expect(fiscaliteVisible({ role: 'super', ...roleLessUser }, newEntrepriseId('1234'), titres)).toBe(true)
})

test('fiscaliteVisible avec les titres', () => {
  expect(fiscaliteVisible({ role: 'super', ...roleLessUser }, newEntrepriseId('1234'), [{ type_id: 'arm' }, { type_id: 'prw' }])).toEqual(true)
  expect(
    fiscaliteVisible({ role: 'entreprise', entreprises: [{ id: newEntrepriseId(newEntrepriseId('1234')) }], ...roleLessUser }, newEntrepriseId('1234'), [
      { type_id: 'prg' },
      { type_id: 'prr' },
      { type_id: 'prs' },
      { type_id: 'prw' },
    ])
  ).toEqual(false)
  expect(fiscaliteVisible({ role: 'entreprise', entreprises: [{ id: newEntrepriseId(newEntrepriseId('1234')) }], ...roleLessUser }, newEntrepriseId('1234'), [])).toEqual(false)
  expect(fiscaliteVisible({ role: 'super', ...roleLessUser }, newEntrepriseId('1234'), [{}])).toBe(false)
})
