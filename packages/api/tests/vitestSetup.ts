import { Request, Response } from 'express'
import { vi } from 'vitest'
vi.mock('../src/tools/api-mailjet/emails', () => ({
  __esModule: true,
  emailsSend: vi.fn().mockImplementation(a => a),
  emailsWithTemplateSend: vi.fn().mockImplementation(a => a),
}))

vi.mock('../src/tools/api-mailjet/index', () => ({
  __esModule: true,
  mailjetAddContactsToGuyaneList: vi.fn().mockImplementation(a => a),
  mailJetSendMail: vi.fn().mockImplementation(a => a),
}))

function assertObject(stuff: unknown): asserts stuff is object {
  if (typeof stuff !== 'object') {
    throw new Error(`${stuff} n'est pas un objet`)
  }
}
vi.resetAllMocks()
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
