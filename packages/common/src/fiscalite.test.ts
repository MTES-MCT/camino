import { fiscaliteVisible, fraisGestion } from './fiscalite.js'
import { test, expect } from 'vitest'
import { User } from './roles.js'
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
        totalInvestissementsDeduits: 0
      }
    })
  ).toBe(16)

  expect(fraisGestion({ redevanceDepartementale: 12.5, redevanceCommunale: 13.2 })).toBe(2.06)
})

test.each<{ user: User; visible: boolean }>([
  { user: null, visible: false },
  { user: undefined, visible: false },
  { user: { role: 'defaut', administrationId: undefined }, visible: false },
  { user: { role: 'bureau d’études', administrationId: undefined }, visible: false },
  { user: { role: 'entreprise', administrationId: undefined, entreprises: [] }, visible: false },
  { user: { role: 'entreprise', administrationId: undefined, entreprises: [{ id: newEntrepriseId('1') }] }, visible: false },
  { user: { role: 'entreprise', administrationId: undefined, entreprises: [{ id: newEntrepriseId('1234') }] }, visible: true },
  { user: { role: 'entreprise', administrationId: undefined, entreprises: [{ id: newEntrepriseId('1') }, { id: newEntrepriseId('1234') }] }, visible: true },
  { user: { role: 'admin', administrationId: 'aut-97300-01' }, visible: true },
  { user: { role: 'editeur', administrationId: 'aut-97300-01' }, visible: true },
  { user: { role: 'lecteur', administrationId: 'aut-97300-01' }, visible: true },
  { user: { role: 'super', administrationId: undefined }, visible: true }
])('fiscaliteVisible $user | $visible', ({ user, visible }) => {
  expect(fiscaliteVisible(user, newEntrepriseId('1234'), [{ domaineId: 'm' }])).toEqual(visible)
})

test('fiscaliteVisible avec les titres', () => {
  expect(fiscaliteVisible({ role: 'super', administrationId: undefined }, newEntrepriseId('1234'), [{ domaineId: 'm' }, { domaineId: 'w' }])).toEqual(true)
  expect(
    fiscaliteVisible({ role: 'entreprise', administrationId: undefined, entreprises: [{ id: newEntrepriseId('1234') }] }, newEntrepriseId('1234'), [
      { domaineId: 'g' },
      { domaineId: 'r' },
      { domaineId: 's' },
      { domaineId: 'w' }
    ])
  ).toEqual(false)
  expect(fiscaliteVisible({ role: 'entreprise', administrationId: undefined, entreprises: [{ id: newEntrepriseId('1234') }] }, newEntrepriseId('1234'), [])).toEqual(false)
  expect(() => fiscaliteVisible({ role: 'super', administrationId: undefined }, newEntrepriseId('1234'), [{}])).toThrowErrorMatchingInlineSnapshot(`"le domaineId d'un titre est obligatoire"`)
})
