import { fiscaliteVisible, fraisGestion, UserFiscalite } from './fiscalite'

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
})

test.each<{ user: UserFiscalite; visible: boolean }>([
  { user: null, visible: false },
  { user: undefined, visible: false },
  { user: { role: 'defaut', administrationId: undefined }, visible: false },
  { user: { role: 'bureau d’études', administrationId: undefined }, visible: false },
  { user: { role: 'entreprise', administrationId: undefined, entreprises: [] }, visible: false },
  { user: { role: 'entreprise', administrationId: undefined, entreprises: [{ id: '1' }] }, visible: false },
  { user: { role: 'entreprise', administrationId: undefined, entreprises: [{ id: '1234' }] }, visible: true },
  { user: { role: 'entreprise', administrationId: undefined, entreprises: [{ id: '1' }, { id: '1234' }] }, visible: true },
  { user: { role: 'admin', administrationId: 'aut-97300-01' }, visible: true },
  { user: { role: 'editeur', administrationId: 'aut-97300-01' }, visible: true },
  { user: { role: 'lecteur', administrationId: 'aut-97300-01' }, visible: true },
  { user: { role: 'super', administrationId: undefined }, visible: true }
])('fiscaliteVisible $user | $visible', toTest => {
  expect(fiscaliteVisible(toTest.user ? { ...toTest.user } : toTest.user, '1234')).toEqual(toTest.visible)
})
