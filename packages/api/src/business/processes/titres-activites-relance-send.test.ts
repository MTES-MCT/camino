import { checkDateAndSendEmail } from './titres-activites-relance-send'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails'
import { EmailTemplateId } from '../../tools/api-mailjet/types'
import { vi, describe, expect, test, afterEach } from 'vitest'
import { getCurrent, toCaminoDate } from 'camino-common/src/date'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { activiteIdValidator } from 'camino-common/src/activite'

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
    const date = toCaminoDate('2022-01-01')

    const email = 'toto.huhu@foo.com'

    const titresActivites = await checkDateAndSendEmail(
      () =>
        Promise.resolve([
          { email, role: 'entreprise' },
          { email: 'emailDeBureauDEtudes', role: 'bureau d’études' },
        ]),
      toCaminoDate('2022-03-18'),
      [
        {
          date,
          id: activiteIdValidator.parse('activiteId'),
          titre: {
            titulaireIds: [entrepriseIdValidator.parse('titulaire1')],
          },
        },
      ]
    )

    expect(emailsWithTemplateSendMock).toBeCalledWith([email], EmailTemplateId.ACTIVITES_RELANCE, expect.any(Object))
    expect(titresActivites.length).toEqual(1)
  })

  test('n’envoie pas d’email aux opérateurs', async () => {
    const titresActivites = await checkDateAndSendEmail(() => Promise.resolve([]), getCurrent(), [
      {
        date: toCaminoDate('1000-01-01'),
        id: activiteIdValidator.parse('activiteId'),
      },
    ])

    expect(titresActivites.length).toEqual(0)
  })
})
