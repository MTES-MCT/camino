import { dbManager } from '../../../tests/db-manager.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { vi, afterAll, beforeAll, describe, test, expect } from 'vitest'
import { uploadAllowedMiddleware } from '../../server/upload.js'
import { Request, Response } from 'express'
import { TestUser } from 'camino-common/src/tests-utils.js'

console.info = vi.fn()
describe('téléversement de fichier par rest (tus)', () => {
  beforeAll(async () => {
    await dbManager.populateDb()
  })

  afterAll(async () => {
    await dbManager.closeKnex()
  })

  describe('permission de téléverser', () => {
    test.each<[TestUser, number]>([
      [
        {
          role: 'admin',
          administrationId: ADMINISTRATION_IDS['DGTM - GUYANE']
        },
        200
      ],
      [{ role: 'super' }, 200],
      [
        {
          role: 'editeur',
          administrationId: ADMINISTRATION_IDS['DGTM - GUYANE']
        },
        200
      ],
      [
        {
          role: 'lecteur',
          administrationId: ADMINISTRATION_IDS['DGTM - GUYANE']
        },
        200
      ],
      [{ role: 'entreprise', entreprises: [] }, 200],
      [{ role: 'defaut' }, 403]
    ])(
      'retourne le code $code pour un utilisateur "$user"',
      async (user, code) => {
        vi.resetAllMocks()
        const req = { user } as unknown as Request
        const res = { sendStatus: vi.fn() } as unknown as Response
        const next = vi.fn()
        await uploadAllowedMiddleware(req, res, next)
        if (code !== 200) {
          expect(res.sendStatus).toBeCalledWith(code)
        } else {
          expect(next).toBeCalled()
        }
      }
    )
  })
})
