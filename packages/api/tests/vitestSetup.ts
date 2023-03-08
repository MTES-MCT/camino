import { Request, Response } from 'express'
import { vi } from 'vitest'
const origEmails = vi.importActual('../src/tools/api-mailjet/emails')
vi.mock('../src/tools/api-mailjet/emails', () => ({
  __esModule: true,
  ...origEmails,
  emailsSend: vi.fn().mockImplementation(a => a),
  emailsWithTemplateSend: vi.fn().mockImplementation(a => a),
}))

vi.mock('../src/tools/api-mailjet/newsletter', () => ({
  __esModule: true,
  newsletterSubscriberUpdate: vi.fn().mockImplementation(() => 'succès'),
}))

function assertObject(stuff: unknown): asserts stuff is object {
  if (typeof stuff !== 'object') {
    throw new Error(`${stuff} n'est pas un objet`)
  }
}
vi.resetAllMocks()
vi.mock('tus-node-server')
vi.mock('../src/server/upload', async () => {
  const origUpload = await vi.importActual('../src/server/upload')

  assertObject(origUpload)

  return {
    __esModule: true,
    ...origUpload,
    restUpload: vi.fn().mockImplementation(() => {
      return (_: Request, res: Response) => {
        res.sendStatus(200)
      }
    }),
  }
})
