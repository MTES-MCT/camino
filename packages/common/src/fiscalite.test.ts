import { fiscaliteVisible } from './fiscalite'
import { Role } from './roles'

// unskip une fois l'accès aux utilisateurs autorisé
test.skip.each`
  user                                                                  | visible
  ${null}                                                               | ${false}
  ${undefined}                                                          | ${false}
  ${{ role: 'defaut' }}                                                 | ${false}
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
    expect(fiscaliteVisible(user, '1234')).toEqual(visible)
  }
)
