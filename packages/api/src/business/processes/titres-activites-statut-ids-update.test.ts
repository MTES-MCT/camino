import { titresActivitesStatutIdsUpdate } from './titres-activites-statut-ids-update'
import { titresActivitesGet } from '../../database/queries/titres-activites'

import {
  titresActivitesDelaiDepasse,
  titresActivitesDelaiNonDepasse
} from './__mocks__/titres-activites-statut-ids-update-activites'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres-activites', () => ({
  titreActiviteUpdate: vi.fn().mockResolvedValue(true),
  titresActivitesGet: vi.fn()
}))

const titresActivitesGetMock = vi.mocked(titresActivitesGet, true)

console.info = vi.fn()

describe("statut des activités d'un titre", () => {
  test("met à jour le statut d'une activité", async () => {
    titresActivitesGetMock.mockResolvedValue(titresActivitesDelaiDepasse)
    const titresActivites = await titresActivitesStatutIdsUpdate()

    expect(titresActivites.length).toEqual(1)
  })

  test("ne met pas à jour le statut d'une activité", async () => {
    titresActivitesGetMock.mockResolvedValue(titresActivitesDelaiNonDepasse)
    const titresActivites = await titresActivitesStatutIdsUpdate()

    expect(titresActivites.length).toEqual(0)
  })
})
