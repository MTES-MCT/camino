import { checkDateAndSendEmail } from './titres-activites-relance-send.js'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails.js'
import { EmailTemplateId } from '../../tools/api-mailjet/types.js'
import { vi, describe, expect, test, afterEach } from 'vitest'
import { getCurrent, toCaminoDate } from 'camino-common/src/date.js'
import { ITitreActivite } from '../../types.js'

vi.mock('../../tools/api-mailjet/emails', () => ({
  __esModule: true,
  emailsWithTemplateSend: vi.fn().mockImplementation(a => a),
}))

const emailsWithTemplateSendMock = vi.mocked(emailsWithTemplateSend, true)

console.info = vi.fn()

describe('relance les opérateurs des activités qui vont se fermer automatiquement', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  test('envoie un email aux opérateurs', async () => {
    const date = '2022-01-01'

    const email = 'toto.huhu@foo.com'

    const activites = [
      {
        date,
        typeId: 'gra',
        titre: {
          titulaires: [{ utilisateurs: [{ email: 'toto.huhu@foo.com' }] }],
        },
      },
    ] as ITitreActivite[]
    const titresActivites = await checkDateAndSendEmail(toCaminoDate('2022-03-18'), activites)

    expect(emailsWithTemplateSendMock).toBeCalledWith([email], EmailTemplateId.ACTIVITES_RELANCE, expect.any(Object))
    expect(titresActivites.length).toEqual(1)
  })

  test('n’envoie pas d’email aux opérateurs', async () => {
    const activites = [
      {
        date: '1000-01-01',
        typeId: 'gra',
      },
    ] as ITitreActivite[]
    const titresActivites = await checkDateAndSendEmail(getCurrent(), activites)

    expect(titresActivites.length).toEqual(0)
  })
})
