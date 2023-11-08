import { restCall } from '../../../tests/_utils/index.js'
import { dbManager } from '../../../tests/db-manager.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { titreCreate } from '../../database/queries/titres.js'
import { ITitre } from '../../types.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { newActiviteId, newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create.js'
import { userSuper } from '../../database/user-super.js'
import { testBlankUser } from 'camino-common/src/tests-utils.js'

console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool
beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('getActivitesByTitreId', () => {
  test('ne peut pas voir les activités (utilisateur anonyme)', async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre simple',
        typeId: 'arm',
        titreStatutId: 'val',
        propsTitreEtapesIds: {},
      },
      {}
    )
    let tested = await restCall(dbPool, '/rest/titres/:titreId/activites', { titreId: titre.id }, undefined)
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)

    tested = await restCall(dbPool, '/rest/titres/:titreId/activites', { titreId: titre.id }, userSuper)
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  })

  const titreWithActiviteGrp = (): ITitre => {
    const titreId = newTitreId()
    const demarcheId = newDemarcheId()
    const activiteId = newActiviteId()

    return {
      id: titreId,
      nom: 'mon titre',
      typeId: 'axm',
      titreStatutId: 'ind',
      publicLecture: true,
      propsTitreEtapesIds: { points: 'titre-id-demarche-id-dpu' },
      activites: [
        {
          titreId,
          id: activiteId,
          date: toCaminoDate('2020-10-01'),
          typeId: 'grp',
          activiteStatutId: ACTIVITES_STATUTS_IDS.ABSENT,
          periodeId: 3,
          annee: 2020,
          utilisateurId: null,
          sections: [
            {
              id: 'renseignements',
              elements: [
                {
                  id: 'orBrut',
                  nom: 'Or brut extrait (g)',
                  type: 'number',
                  description: 'Masse d’or brut',
                },
                {
                  id: 'orExtrait',
                  nom: 'Or extrait (g)',
                  type: 'number',
                  description: "Masse d'or brut extrait au cours du trimestre.",
                },
              ],
            },
          ],
        },
      ],
      demarches: [
        {
          id: demarcheId,
          titreId,
          typeId: 'oct',
          publicLecture: true,
          etapes: [
            {
              id: newEtapeId(),
              typeId: 'dpu',
              ordre: 0,
              titreDemarcheId: demarcheId,
              statutId: 'acc',
              date: toCaminoDate('2020-02-02'),
              administrationsLocales: ['dea-guyane-01'],
            },
          ],
        },
      ],
    }
  }
  test('peut modifier les activités GRP (utilisateur DEAL Guyane)', async () => {
    const titre = await titreCreate(titreWithActiviteGrp(), {})

    const tested = await restCall(dbPool, '/rest/titres/:titreId/activites', { titreId: titre.id }, { ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] })
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)

    expect(tested.body).toHaveLength(1)
    expect(tested.body[0]).toMatchObject({
      activites: [{ modification: true }],
    })
  })

  test('ne peut pas voir les activités GRP (utilisateur CACEM)', async () => {
    const titre = await titreCreate(titreWithActiviteGrp(), {})
    const tested = await restCall(dbPool, '/rest/titres/:titreId/activites', { titreId: titre.id }, { ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS.CACEM })
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)
  })
})
