import { restUploadCall, TestUser } from '../../../tests/_utils'
import { dbManager } from '../../../tests/db-manager'
import { ADMINISTRATION_IDS } from 'camino-common/src/administrations'

jest.mock('tus-node-server')

console.info = jest.fn()
describe('téléversement de fichier par rest (tus)', () => {
  beforeAll(async () => {
    await dbManager.populateDb()
  })

  afterAll(async () => {
    await dbManager.closeKnex()
  })

  describe('permission de téléverser', () => {
    test.each`
      user                                                                          | code
      ${{ role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] }}   | ${200}
      ${{ role: 'super' }}                                                          | ${200}
      ${{ role: 'editeur', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] }} | ${200}
      ${{ role: 'lecteur', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] }} | ${200}
      ${{ role: 'entreprise', entreprises: [] }}                                    | ${200}
      ${{ role: 'defaut' }}                                                         | ${403}
    `(
      'retourne le code $code pour un utilisateur "$user"',
      async ({ user, code }: { user: TestUser; code: string }) => {
        const res = await restUploadCall(user)
        expect(res.statusCode).toBe(code)
      }
    )
  })
})
