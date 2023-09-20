import { titresActivitesGet } from '../../database/queries/titres-activites.js'

import TitresActivites from '../../database/models/titres-activites.js'
import { titresActivitesRelanceSend } from './titres-activites-relance-send.js'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails.js'
import { EmailTemplateId } from '../../tools/api-mailjet/types.js'
import { vi, describe, expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
vi.mock('../../database/queries/titres-activites', () => ({
  titresActivitesGet: vi.fn(),
}))

vi.mock('../../tools/api-mailjet/emails', () => ({
  __esModule: true,
  emailsWithTemplateSend: vi.fn().mockImplementation(a => a),
}))

const titresActivitesGetMock = vi.mocked(titresActivitesGet, true)
const emailsWithTemplateSendMock = vi.mocked(emailsWithTemplateSend, true)

console.info = vi.fn()

describe('relance les opérateurs des activités qui vont se fermer automatiquement', () => {
  test('envoie un email aux opérateurs', async () => {
    const date = '2022-01-01'

    const email = 'toto.huhu@foo.com'

    titresActivitesGetMock.mockResolvedValue([
      {
        date,
        typeId: 'gra',
        titre: {
          titulaires: [{ utilisateurs: [{ email: 'toto.huhu@foo.com' }] }],
        },
      },
    ] as TitresActivites[])
    const titresActivites = await titresActivitesRelanceSend(toCaminoDate('2022-03-18'))

    expect(emailsWithTemplateSendMock).toBeCalledWith([email], EmailTemplateId.ACTIVITES_RELANCE, expect.any(Object))
    expect(titresActivites.length).toEqual(1)
  })

  test('n’envoie pas d’email aux opérateurs', async () => {
    titresActivitesGetMock.mockResolvedValue([
      {
        date: '1000-01-01',
        typeId: 'gra',
      },
    ] as TitresActivites[])
    const titresActivites = await titresActivitesRelanceSend()

    expect(titresActivites.length).toEqual(0)
  })
})
