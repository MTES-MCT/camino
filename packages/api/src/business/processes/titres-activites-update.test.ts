import { ITitreActivite } from '../../types.js'

import { titresActivitesUpdate } from './titres-activites-update.js'
import { titreActiviteTypeCheck } from '../utils/titre-activite-type-check.js'
import { anneesBuild } from '../../tools/annees-build.js'
import { titresActivitesUpsert } from '../../database/queries/titres-activites.js'
import { titresGet } from '../../database/queries/titres.js'
import { titreActivitesBuild } from '../rules/titre-activites-build.js'

import { titresToutesActivites, titresSansActivite } from './__mocks__/titres-activites-update-titres.js'
import { emailsSend, emailsWithTemplateSend } from '../../tools/api-mailjet/emails.js'
import { EmailTemplateId } from '../../tools/api-mailjet/types.js'
import { vi, afterEach, describe, expect, test } from 'vitest'

vi.mock('../../database/queries/titres', () => ({
  titresGet: vi.fn(),
}))

vi.mock('../utils/titre-activite-type-check', () => ({
  __esModule: true,
  titreActiviteTypeCheck: vi.fn(),
}))

vi.mock('../../tools/annees-build', () => ({
  __esModule: true,
  anneesBuild: vi.fn(),
}))

vi.mock('../../database/queries/titres-activites', () => ({
  __esModule: true,
  titresActivitesUpsert: vi.fn().mockResolvedValue(true),
}))

vi.mock('../rules/titre-activites-build', () => ({
  __esModule: true,
  titreActivitesBuild: vi.fn().mockResolvedValue(true),
}))

vi.mock('../../tools/api-mailjet/emails', () => ({
  __esModule: true,
  emailsSend: vi.fn().mockImplementation(a => a),
  emailsWithTemplateSend: vi.fn().mockImplementation(a => a),
}))

const titresGetMock = vi.mocked(titresGet, true)
const titreActiviteTypeCheckMock = vi.mocked(titreActiviteTypeCheck, true)
const anneesBuildMock = vi.mocked(anneesBuild, true)
const titreActivitesBuildMock = vi.mocked(titreActivitesBuild, true)
const emailsSendMock = vi.mocked(emailsSend, true)
const emailsWithTemplateSendMock = vi.mocked(emailsWithTemplateSend, true)

console.info = vi.fn()
afterEach(() => {
  vi.resetAllMocks()
})
describe("activités d'un titre", () => {
  test('met à jour un titre sans activité', async () => {
    titresGetMock.mockResolvedValue(titresSansActivite)
    titreActiviteTypeCheckMock.mockReturnValue(true)
    anneesBuildMock.mockReturnValue([2018])
    titreActivitesBuildMock.mockReturnValue([{ titreId: titresSansActivite[0].id }] as ITitreActivite[])

    const titresActivitesNew = await titresActivitesUpdate()

    expect(titresActivitesNew.length).toEqual(1)

    expect(titreActiviteTypeCheck).toHaveBeenCalledTimes(titresSansActivite.length)
    expect(titresActivitesUpsert).toHaveBeenCalled()
    expect(titreActivitesBuild).toHaveBeenCalled()
    expect(emailsWithTemplateSendMock).toHaveBeenCalledWith(['email'], EmailTemplateId.ACTIVITES_NOUVELLES, expect.any(Object))
  })

  test('ne met pas à jour un titre possédant déjà des activités', async () => {
    titresGetMock.mockResolvedValue(titresToutesActivites)
    titreActiviteTypeCheckMock.mockReturnValue(true)
    anneesBuildMock.mockReturnValue([2018])
    titreActivitesBuildMock.mockReturnValue([])

    const titresActivitesNew = await titresActivitesUpdate()

    expect(titresActivitesNew.length).toEqual(0)

    expect(titreActiviteTypeCheck).toHaveBeenCalledTimes(1)
    expect(titreActivitesBuild).toHaveBeenCalled()
    expect(titresActivitesUpsert).not.toHaveBeenCalled()
    expect(emailsSendMock).not.toHaveBeenCalled()
  })

  test("ne met pas à jour un titre ne correspondant à aucun type d'activité", async () => {
    titresGetMock.mockResolvedValue(titresSansActivite)
    titreActiviteTypeCheckMock.mockReturnValue(false)
    anneesBuildMock.mockReturnValue([2018])

    const titresActivitesNew = await titresActivitesUpdate()

    expect(titresActivitesNew.length).toEqual(0)

    expect(titreActiviteTypeCheck).toHaveBeenCalledTimes(1)
    expect(titreActivitesBuild).not.toHaveBeenCalled()
    expect(titresActivitesUpsert).not.toHaveBeenCalled()
  })

  test('ne met pas à jour de titre si les activités ne sont valables sur aucune année', async () => {
    titresGetMock.mockResolvedValue(titresSansActivite)
    titreActiviteTypeCheckMock.mockReturnValue(false)
    anneesBuildMock.mockReturnValue([])

    const titresActivitesNew = await titresActivitesUpdate()

    expect(titresActivitesNew.length).toEqual(0)

    expect(titreActiviteTypeCheck).not.toHaveBeenCalled()
    expect(titreActivitesBuild).not.toHaveBeenCalled()
    expect(titresActivitesUpsert).not.toHaveBeenCalled()
  })
})
