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
import { entrepriseIdValidator } from 'camino-common/src/entreprise.js'
import { TestUser, testBlankUser } from 'camino-common/src/tests-utils.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { Knex } from 'knex'
import { ETAPE_IS_BROUILLON } from 'camino-common/src/etape.js'

console.info = vi.fn()
console.error = vi.fn()

let knex: Knex<any, unknown[]>
let dbPool: Pool
beforeAll(async () => {
  const { knex: knexInstance, pool } = await dbManager.populateDb()
  dbPool = pool
  knex = knexInstance
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
        isBrouillon: ETAPE_IS_BROUILLON,
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
        isBrouillon: ETAPE_IS_BROUILLON,
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

  test('un titulaire peut voir mais ne peut pas supprimer sa demande', async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        typeId: 'arm',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
        publicLecture: false,
      },
      {}
    )
    const titreDemarche = await titreDemarcheCreate({
      titreId: titre.id,
      typeId: 'oct',
      publicLecture: false,
      entreprisesLecture: true,
    })
    const titulaireId1 = entrepriseIdValidator.parse('titulaireid1')
    await entrepriseUpsert({
      id: titulaireId1,
      nom: 'Mon Entreprise',
    })
    const titreEtape = await titreEtapeCreate(
      {
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: true,
        ordre: 1,
        titreDemarcheId: titreDemarche.id,
        date: toCaminoDate('2018-01-01'),
        titulaireIds: [titulaireId1],
      },
      userSuper,
      titre.id
    )
    await knex('titres')
      .update({ propsTitreEtapesIds: { titulaires: titreEtape.id } })
      .where('id', titre.id)
    const user: TestUser = {
      ...testBlankUser,
      role: 'entreprise',
      entreprises: [{ id: titulaireId1, nom: 'titulaire1' }],
    }

    const getEtape = await restCall(dbPool, '/rest/titres/:titreId', { titreId: titre.id }, user)
    expect(getEtape.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)

    const tested = await restDeleteCall(dbPool, '/rest/etapes/:etapeId', { etapeId: titreEtape.id }, user)

    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  })
})
