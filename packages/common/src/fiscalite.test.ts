import { fiscaliteVisible, fraisGestion } from './fiscalite'
import { Role } from './roles'

test('fraisGestion', () => {
  expect(
    fraisGestion({ redevanceDepartementale: 50, redevanceCommunale: 50 })
  ).toBe(8)
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

// unskip une fois l'accès aux utilisateurs autorisé
test.skip.each`
  user                                                                  | visible
  ${null}                                                               | ${false}
  ${undefined}                                                          | ${false}
  ${{ role: 'defaut' }}                                                 | ${false}
  ${{ role: 'bureau d’études' }}                                        | ${false}
  ${{ role: 'entreprise' }}                                             | ${false}
  ${{ role: 'entreprise', entreprises: [] }}                            | ${false}
  ${{ role: 'entreprise', entreprises: [{ id: '1' }] }}                 | ${false}
  ${{ role: 'entreprise', entreprises: [{ id: '1234' }] }}              | ${true}
  ${{ role: 'entreprise', entreprises: [{ id: '1' }, { id: '1234' }] }} | ${true}
  ${{ role: 'admin' }}                                                  | ${true}
  ${{ role: 'editeur' }}                                                | ${true}
  ${{ role: 'lecteur' }}                                                | ${true}
  ${{ role: 'super' }}                                                  | ${true}
`(
  'fiscaliteVisible',
  ({
    user,
    visible
  }: {
    user:
      | {
          entreprises?: { id: string }[] | null
          role: Role
        }
      | undefined
      | null
    visible: boolean
  }) => {
    expect(fiscaliteVisible(user ? { ...user, administrationId: undefined } : user, '1234')).toEqual(visible)
  }
)
