import { dbManager } from '../../../tests/db-manager.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { restCall, restDeleteCall } from '../../../tests/_utils/index.js'
import { getCurrent, toCaminoDate } from 'camino-common/src/date.js'
import { afterAll, beforeAll, test, expect, describe, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { Role, isAdministrationRole } from 'camino-common/src/roles.js'
import { titreEtapeCreate } from '../../database/queries/titres-etapes.js'

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

test('getEtapesTypesEtapesStatusWithMainStep', async () => {
  const titre = await titreCreate(
    {
      nom: 'nomTitre',
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
    },
    {}
  )

  const titreDemarche = await titreDemarcheCreate({
    titreId: titre.id,
    typeId: 'oct',
  })

  const tested = await restCall(dbPool, '/rest/etapesTypes/:demarcheId/:date', { demarcheId: titreDemarche.id, date: getCurrent() }, userSuper)

  expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  expect(tested.body).toMatchInlineSnapshot(`
    [
      {
        "etapeStatutId": "fai",
        "etapeTypeId": "mfr",
        "mainStep": true,
      },
      {
        "etapeStatutId": "fai",
        "etapeTypeId": "mfr",
        "mainStep": true,
      },
      {
        "etapeStatutId": "fai",
        "etapeTypeId": "mfr",
        "mainStep": true,
      },
      {
        "etapeStatutId": "fai",
        "etapeTypeId": "mfr",
        "mainStep": true,
      },
      {
        "etapeStatutId": "fai",
        "etapeTypeId": "mfr",
        "mainStep": true,
      },
      {
        "etapeStatutId": "fai",
        "etapeTypeId": "pfd",
        "mainStep": true,
      },
      {
        "etapeStatutId": "req",
        "etapeTypeId": "dae",
        "mainStep": false,
      },
      {
        "etapeStatutId": "exe",
        "etapeTypeId": "dae",
        "mainStep": true,
      },
      {
        "etapeStatutId": "def",
        "etapeTypeId": "rde",
        "mainStep": false,
      },
      {
        "etapeStatutId": "fav",
        "etapeTypeId": "rde",
        "mainStep": true,
      },
    ]
  `)
})
describe('etapeSupprimer', () => {
  test.each([undefined, 'admin' as Role])('ne peut pas supprimer une étape (utilisateur %s)', async (role: Role | undefined) => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        typeId: 'arm',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
      },
      {}
    )
    const titreDemarche = await titreDemarcheCreate({
      titreId: titre.id,
      typeId: 'oct',
    })

    const titreEtape = await titreEtapeCreate(
      {
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: true,
        ordre: 1,
        titreDemarcheId: titreDemarche.id,
        date: toCaminoDate('2018-01-01'),
      },
      userSuper,
      titre.id
    )
    const tested = await restDeleteCall(dbPool, '/rest/etapes/:etapeId', { etapeId: titreEtape.id }, role && isAdministrationRole(role) ? { role, administrationId: 'dea-guyane-01' } : undefined)

    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  })

  test('peut supprimer une étape (utilisateur super)', async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        typeId: 'arm',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
      },
      {}
    )
    const titreDemarche = await titreDemarcheCreate({
      titreId: titre.id,
      typeId: 'oct',
    })

    const titreEtape = await titreEtapeCreate(
      {
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: true,
        ordre: 1,
        titreDemarcheId: titreDemarche.id,
        date: toCaminoDate('2018-01-01'),
      },
      userSuper,
      titre.id
    )
    const tested = await restDeleteCall(dbPool, '/rest/etapes/:etapeId', { etapeId: titreEtape.id }, userSuper)

    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
  })
})
