import { ITitreActivite, ITitreDemarche } from '../../types'

import { titreActivitesBuild } from './titre-activites-build'

import { describe, expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'

const titreId = titreIdValidator.parse('titre-id')

describe("construction des activités d'un titre", () => {
  const aujourdhui = toCaminoDate('2021-01-01')

  test("ne crée pas d'activité pour un titre qui n'a pas de phase de démarches", async () => {
    const titreActivites1 = await titreActivitesBuild(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], [2020], aujourdhui, titreId, 'pxm', undefined)

    expect(titreActivites1.length).toEqual(0)

    const titreActivites2 = await titreActivitesBuild(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], [2020], aujourdhui, titreId, 'pxm', [])

    expect(titreActivites2.length).toEqual(0)

    const titreActivites3 = await titreActivitesBuild(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], [2020], aujourdhui, titreId, 'pxm', [
      { id: 'demarche-id' } as unknown as ITitreDemarche,
    ])

    expect(titreActivites3.length).toEqual(0)
  })

  test('ne crée pas une activité si elle existe déjà', async () => {
    const res = await titreActivitesBuild(
      ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions M)"],
      [2018],
      aujourdhui,
      titreId,
      'pxm',
      [{ id: 'demarche-id', phase: {} } as unknown as ITitreDemarche],
      [{ typeId: 'gra', annee: 2018, periodeId: 1 }] as ITitreActivite[]
    )

    expect(res.length).toEqual(0)
  })

  test("ne crée pas une activité si sa date de fin n'a pas eu lieu", async () => {
    const res = await titreActivitesBuild(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], [2021], aujourdhui, titreId, 'pxm', [
      { id: 'demarche-id', phase: {} } as unknown as ITitreDemarche,
    ])

    expect(res.length).toEqual(0)
  })

  test('crée des activités', async () => {
    const titreActivitesA = await titreActivitesBuild(ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions M)"], [2018], aujourdhui, titreId, 'pxm', [
      {
        id: newDemarcheId('demarche-id'),
        titreId: newTitreId('titreId'),
        statutId: 'acc',
        typeId: 'oct',
        demarcheDateDebut: toCaminoDate('2018-01-01'),
        demarcheDateFin: toCaminoDate('2018-12-31'),
        etapes: [
          {
            id: newEtapeId('etape-id'),
            titreDemarcheId: newDemarcheId('demarche-id'),
            date: toCaminoDate('2018-01-01'),
            typeId: 'dpu',
            statutId: 'fai',
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            substances: ['auru', 'nacl'],
            surface: null,
            ordre: 1,
            communes: null,
          },
        ],
      },
    ])

    expect(titreActivitesA).toMatchSnapshot()

    const titreActivitesB = await titreActivitesBuild(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], [2018], aujourdhui, titreId, 'pxm', [
      {
        id: 'demarche-id',
        demarcheDateDebut: '2018-01-01',
        demarcheDateFin: '2018-12-31',
        typeId: 'oct',
      } as ITitreDemarche,
    ])

    expect(titreActivitesB).toMatchSnapshot()
  })

  test("ne crée pas d'activité si le titre n'est pas valide pour la période", async () => {
    const titreActivites = await titreActivitesBuild(ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"], [2018], aujourdhui, titreId, 'pxm', [
      { id: 'demarche-id', phase: {}, type: {} } as unknown as ITitreDemarche,
    ])

    expect(titreActivites.length).toEqual(0)
  })

  test("ne crée pas d'activités si les sections sont vides", async () => {
    const titreActivitesA = await titreActivitesBuild(ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions M)"], [2018], aujourdhui, titreId, 'pxm', [
      {
        id: 'demarche-id',
        statutId: 'acc',
        typeId: 'oct',
        type: { id: 'oct' },
        phase: { dateDebut: '2018-01-01', dateFin: '2018-12-31' },
        etapes: [
          {
            id: 'etape-id',
            date: '2018-01-01',
            typeId: 'dpu',
            statutId: 'fai',
            substances: [],
          },
        ],
      } as unknown as ITitreDemarche,
    ])

    expect(titreActivitesA).toEqual([])

    const titreActivitesB = await titreActivitesBuild(ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions M)"], [2018], aujourdhui, titreId, 'pxm', [
      {
        id: 'demarche-id',
        statutId: 'acc',
        typeId: 'oct',
        type: { id: 'oct' },
        phase: { dateDebut: '2018-01-01', dateFin: '2018-12-31' },
        etapes: [
          {
            id: 'etape-id',
            date: '2018-01-01',
            typeId: 'dpu',
            statutId: 'fai',
            substances: null,
          },
        ],
      } as unknown as ITitreDemarche,
    ])

    expect(titreActivitesB).toEqual([])

    const titreActivitesD = await titreActivitesBuild(ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions M)"], [2018], aujourdhui, titreId, 'pxm', [
      {
        id: 'demarche-id',
        activiteStatutId: 'acc',
        typeId: 'oct',
        type: {},
        phase: { dateDebut: '2018-01-01', dateFin: '2018-12-31' },
      } as unknown as ITitreDemarche,
    ])

    expect(titreActivitesD).toEqual([])
  })
})
