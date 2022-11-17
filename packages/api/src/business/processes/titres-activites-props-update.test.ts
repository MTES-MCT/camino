import { titresActivitesPropsUpdate } from './titres-activites-props-update'
import { titresActivitesUpsert } from '../../database/queries/titres-activites'
import { titresGet } from '../../database/queries/titres'
import { titreValideCheck } from '../utils/titre-valide-check'
import { vi, describe, expect, test, afterEach } from 'vitest'
import {
  titresActivitesToUpdate,
  titresActivitesNotToUpdate
} from './__mocks__/titre-activite-props-update'

vi.mock('../../database/queries/titres-activites', () => ({
  titresActivitesUpsert: vi.fn()
}))

vi.mock('../../database/queries/titres', () => ({
  titresGet: vi.fn()
}))

vi.mock('../utils/titre-valide-check', () => ({
  titreValideCheck: vi.fn()
}))

const titresActivitesUpsertMock = vi.mocked(titresActivitesUpsert, true)
const titresGetMock = vi.mocked(titresGet, true)
const titreValideCheckMock = vi.mocked(titreValideCheck, true)

console.info = vi.fn()
afterEach(() => {
  vi.resetAllMocks()
})
describe("propriété des activités d'un titre", () => {
  test("met à jour la propriété suppression d'une activité", async () => {
    titresGetMock.mockResolvedValue(titresActivitesToUpdate)
    titreValideCheckMock.mockReturnValueOnce(false)
    titreValideCheckMock.mockReturnValueOnce(false)
    titreValideCheckMock.mockReturnValueOnce(true)
    titreValideCheckMock.mockReturnValueOnce(true)
    const titresActivitesUpdated = await titresActivitesPropsUpdate()

    expect(titresActivitesUpdated).toEqual([
      'titre-activite-id-2019-04',
      'titre-activite-id-2020-01'
    ])
    expect(titresActivitesUpsertMock).toHaveBeenCalled()
  })
  test("be met pas à jour la propriété suppression d'une activité", async () => {
    titresGetMock.mockResolvedValue(titresActivitesNotToUpdate)
    const titresActivitesUpdated = await titresActivitesPropsUpdate()

    expect(titresActivitesUpdated).toEqual([])
    expect(titresActivitesUpsertMock).not.toHaveBeenCalled()
  })
})
