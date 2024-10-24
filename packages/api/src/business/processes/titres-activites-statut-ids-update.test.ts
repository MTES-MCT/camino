import { titresActivitesStatutIdsUpdate } from './titres-activites-statut-ids-update'
import { titresActivitesGet } from '../../database/queries/titres-activites'

import { vi, describe, expect, test } from 'vitest'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import TitresActivites from '../../database/models/titres-activites'
vi.mock('../../database/queries/titres-activites', () => ({
  titreActiviteUpdate: vi.fn().mockResolvedValue(true),
  titresActivitesGet: vi.fn(),
}))

const titresActivitesGetMock = vi.mocked(titresActivitesGet, true)

console.info = vi.fn()

const titresActivitesDelaiDepasse = [
  {
    date: '1000-01-01',
    activiteStatutId: ACTIVITES_STATUTS_IDS.ABSENT,
    typeId: 'gra',
  },
] as TitresActivites[]

const titresActivitesDelaiNonDepasse = [
  {
    date: '3000-01-01',
    activiteStatutId: ACTIVITES_STATUTS_IDS.ABSENT,
    typeId: 'gra',
  },
] as TitresActivites[]

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
