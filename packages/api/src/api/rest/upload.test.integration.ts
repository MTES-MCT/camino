import { dbManager } from '../../../tests/db-manager'
import { vi, afterAll, beforeAll, describe, test, expect } from 'vitest'
import { Role } from 'camino-common/src/roles'
import { uploadAllowedMiddleware } from '../../server/upload'
import { utilisateurCreate } from '../../database/queries/utilisateurs'
import { Request, Response } from 'express'

console.info = vi.fn()
describe('téléversement de fichier par rest (tus)', () => {
  beforeAll(async () => {
    await dbManager.populateDb()
  })

  afterAll(async () => {
    await dbManager.closeKnex()
  })

  describe('permission de téléverser', () => {
    test.each<[{ role: Role; code: number }]>([
      [{ role: 'admin', code: 200 }],
      [{ role: 'super', code: 200 }],
      [{ role: 'editeur', code: 200 }],
      [{ role: 'lecteur', code: 200 }],
      [{ role: 'entreprise', code: 200 }],
      [{ role: 'defaut', code: 403 }]
    ])(
      'retourne le code $code pour un utilisateur "$role"',
      async ({ role, code }) => {
        vi.resetAllMocks()
        const id = `upload-${role}`
        await utilisateurCreate(
          {
            id,
            prenom: `prenom-${role}`,
            nom: `nom-${role}`,
            email: `${id}@camino.local`,
            motDePasse: 'mot-de-passe',
            dateCreation: '2022-11-19',
            role,
            administrationId: undefined
          },
          {}
        )
        const req = { user: { id } } as unknown as Request
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
