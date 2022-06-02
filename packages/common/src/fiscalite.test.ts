import { fiscaliteVisible } from './fiscalite'
import { PermissionId } from './permissions'

// unskip une fois l'accès aux utilisateurs autorisé
test.skip.each`
  user                                                                          | visible
  ${null}                                                                       | ${false}
  ${undefined}                                                                  | ${false}
  ${{ permissionId: 'defaut' }}                                                 | ${false}
  ${{ permissionId: 'entreprise' }}                                             | ${false}
  ${{ permissionId: 'entreprise', entreprises: [] }}                            | ${false}
  ${{ permissionId: 'entreprise', entreprises: [{ id: '1' }] }}                 | ${false}
  ${{ permissionId: 'entreprise', entreprises: [{ id: '1234' }] }}              | ${true}
  ${{ permissionId: 'entreprise', entreprises: [{ id: '1' }, { id: '1234' }] }} | ${true}
  ${{ permissionId: 'admin' }}                                                  | ${true}
  ${{ permissionId: 'editeur' }}                                                | ${true}
  ${{ permissionId: 'lecteur' }}                                                | ${true}
  ${{ permissionId: 'super' }}                                                  | ${true}
  ${{ permission: { id: 'super' } }}                                            | ${true}
`(
  'fiscaliteVisible',
  ({
    user,
    visible
  }: {
    user:
      | {
          entreprises?: { id: string }[] | null
          permissionId?: PermissionId
          permission?: { id: PermissionId }
        }
      | undefined
      | null
    visible: boolean
  }) => {
    expect(fiscaliteVisible(user, '1234')).toEqual(visible)
  }
)
