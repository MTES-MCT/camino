import { dbManager } from '../../../tests/db-manager'
import { userSuper } from '../../database/user-super'
import { restCall, restDeleteCall, restNewCall } from '../../../tests/_utils/index'
import { caminoDateValidator, dateAddDays, toCaminoDate } from 'camino-common/src/date'
import { afterAll, beforeAll, test, expect, describe, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { Role, isAdministrationRole } from 'camino-common/src/roles'
import { titreEtapeUpdate } from '../../database/queries/titres-etapes'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { TestUser, testBlankUser } from 'camino-common/src/tests-utils'
import { entrepriseUpsert } from '../../database/queries/entreprises'
import { Knex } from 'knex'
import { ETAPE_IS_BROUILLON, etapeAvisIdValidator, TempEtapeAvis } from 'camino-common/src/etape'
import { insertEtapeAvisWithLargeObjectId } from '../../database/queries/titres-etapes.queries'
import { largeObjectIdValidator } from '../../database/largeobjects'
import { AvisVisibilityIds } from 'camino-common/src/static/avisTypes'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create'
import { insertTitreGraph } from '../../../tests/integration-test-helper'
import { callAndExit } from '../../tools/fp-tools'
import { DATE_DEBUT_PROCEDURE_SPECIFIQUE_AXM_ARM } from 'camino-common/src/machines'

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

describe('getEtapesTypesEtapesStatusWithMainStep', () => {
  test('nouvelle étapes possibles procédure dédiée octroi ARM', async () => {
    const titreId = newTitreId()
    const demarcheId = newDemarcheId()
    await insertTitreGraph({
      id: titreId,
      nom: 'nomTitre',
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheId,
          titreId,
          typeId: 'oct',
        },
      ],
    })

    const tested = await restNewCall(dbPool, '/rest/etapesTypes/:demarcheId/:date', { demarcheId: demarcheId, date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE_AXM_ARM, -5) }, userSuper)

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "dae": {
          "etapeStatutIds": [
            "req",
            "exe",
          ],
          "mainStep": true,
        },
        "mfr": {
          "etapeStatutIds": [
            "fai",
          ],
          "mainStep": true,
        },
        "pfd": {
          "etapeStatutIds": [
            "fai",
          ],
          "mainStep": true,
        },
        "rde": {
          "etapeStatutIds": [
            "fav",
            "def",
          ],
          "mainStep": true,
        },
      }
    `)
  })
  test('nouvelle étapes possibles (procédure spécifique, octroi ARM)', async () => {
    const titreId = newTitreId()
    const demarcheId = newDemarcheId()
    await insertTitreGraph({
      id: titreId,
      nom: 'nomTitre',
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheId,
          titreId,
          typeId: 'oct',
        },
      ],
    })

    const tested = await restNewCall(dbPool, '/rest/etapesTypes/:demarcheId/:date', { demarcheId: demarcheId, date: DATE_DEBUT_PROCEDURE_SPECIFIQUE_AXM_ARM }, userSuper)

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)
    expect(tested.body).toMatchInlineSnapshot(`
        {
          "mfr": {
            "etapeStatutIds": [
              "fai",
            ],
            "mainStep": true,
          },
        }
      `)
  })
  test('nouvelle étapes possibles prends en compte les brouillons', async () => {
    const titreId = newTitreId()
    const demarcheId = newDemarcheId()
    const etapeId = newEtapeId()
    await insertTitreGraph({
      id: titreId,
      nom: 'nomTitre',
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheId,
          titreId,
          typeId: 'oct',
          etapes: [
            {
              id: etapeId,
              typeId: 'mfr',
              date: toCaminoDate('2024-06-27'),
              titreDemarcheId: demarcheId,
              statutId: 'fai',
              isBrouillon: ETAPE_IS_BROUILLON,
            },
          ],
        },
      ],
    })

    const tested = await restNewCall(dbPool, '/rest/etapesTypes/:demarcheId/:date', { demarcheId: demarcheId, date: toCaminoDate('2024-09-01') }, userSuper)

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "dae": {
          "etapeStatutIds": [
            "req",
            "exe",
          ],
          "mainStep": true,
        },
        "pfd": {
          "etapeStatutIds": [
            "fai",
          ],
          "mainStep": true,
        },
        "rde": {
          "etapeStatutIds": [
            "fav",
            "def",
          ],
          "mainStep": true,
        },
      }
    `)
  })
})

describe('etapeSupprimer', () => {
  test.each([undefined, 'admin' as Role])('ne peut pas supprimer une étape (utilisateur %s)', async (role: Role | undefined) => {
    const titreId = newTitreId()
    const demarcheId = newDemarcheId()
    const etapeId = newEtapeId()
    await insertTitreGraph({
      id: titreId,
      nom: 'nomTitre',
      typeId: 'arm',
      titreStatutId: 'ind',
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheId,
          titreId,
          typeId: 'oct',
          etapes: [
            {
              id: etapeId,
              typeId: 'mfr',
              statutId: 'fai',
              isBrouillon: ETAPE_IS_BROUILLON,
              ordre: 1,
              titreDemarcheId: demarcheId,
              date: toCaminoDate('2018-01-01'),
            },
          ],
        },
      ],
    })

    const tested = await restDeleteCall(
      dbPool,
      '/rest/etapes/:etapeIdOrSlug',
      { etapeIdOrSlug: etapeId },
      role && isAdministrationRole(role) ? { role, administrationId: 'min-mctrct-dgcl-01' } : undefined
    )

    expect(tested.statusCode).toBe(HTTP_STATUS.FORBIDDEN)
  })

  test('peut supprimer une étape (utilisateur super)', async () => {
    const titreId = newTitreId()
    const demarcheId = newDemarcheId()
    const etapeId = newEtapeId()
    await insertTitreGraph({
      id: titreId,
      nom: 'nomTitre',
      typeId: 'arm',
      titreStatutId: 'ind',
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheId,
          titreId,
          typeId: 'oct',
          etapes: [
            {
              id: etapeId,
              typeId: 'mfr',
              statutId: 'fai',
              isBrouillon: ETAPE_IS_BROUILLON,
              ordre: 1,
              titreDemarcheId: demarcheId,
              date: toCaminoDate('2018-01-01'),
            },
          ],
        },
      ],
    })

    const tested = await restDeleteCall(dbPool, '/rest/etapes/:etapeIdOrSlug', { etapeIdOrSlug: etapeId }, userSuper)

    expect(tested.statusCode).toBe(HTTP_STATUS.NO_CONTENT)
  })

  test('un titulaire peut voir mais ne peut pas supprimer sa demande', async () => {
    const titulaireId1 = entrepriseIdValidator.parse('titulaireid1')
    await entrepriseUpsert({
      id: titulaireId1,
      nom: 'Mon Entreprise',
    })
    const titreId = newTitreId()
    const demarcheId = newDemarcheId()
    const etapeId = newEtapeId()
    await insertTitreGraph({
      id: titreId,
      nom: 'nomTitre',
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
      publicLecture: false,
      demarches: [
        {
          id: demarcheId,
          titreId,
          typeId: 'oct',
          publicLecture: false,
          entreprisesLecture: true,
          etapes: [
            {
              id: etapeId,
              typeId: 'mfr',
              statutId: 'fai',
              isBrouillon: ETAPE_IS_BROUILLON,
              ordre: 1,
              titreDemarcheId: demarcheId,
              date: toCaminoDate('2018-01-01'),
              titulaireIds: [titulaireId1],
            },
          ],
        },
      ],
    })

    await knex('titres')
      .update({ propsTitreEtapesIds: { titulaires: etapeId } })
      .where('id', titreId)
    const user: TestUser = {
      ...testBlankUser,
      role: 'entreprise',
      entrepriseIds: [titulaireId1],
    }

    const getEtape = await restCall(dbPool, '/rest/titres/:titreId', { titreId: titreId }, user)
    expect(getEtape.statusCode).toBe(HTTP_STATUS.OK)

    const tested = await restDeleteCall(dbPool, '/rest/etapes/:etapeIdOrSlug', { etapeIdOrSlug: etapeId }, user)

    expect(tested.statusCode).toBe(HTTP_STATUS.FORBIDDEN)
  })
})

describe('getEtapeAvis', () => {
  test('test la récupération des avis', async () => {
    const titreId = newTitreId()
    const demarcheId = newDemarcheId()
    const etapeId = newEtapeId()
    await insertTitreGraph({
      id: titreId,
      nom: 'nomTitre',
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheId,
          titreId,
          typeId: 'oct',
          etapes: [
            {
              id: etapeId,
              typeId: 'mfr',
              statutId: 'fai',
              isBrouillon: ETAPE_IS_BROUILLON,
              ordre: 1,
              titreDemarcheId: demarcheId,
              date: toCaminoDate('2018-01-01'),
            },
          ],
        },
      ],
    })

    let getAvis = await restCall(dbPool, '/rest/etapes/:etapeId/etapeAvis', { etapeId: etapeId }, userSuper)
    expect(getAvis.statusCode).toBe(HTTP_STATUS.OK)
    expect(getAvis.body).toStrictEqual([])

    await titreEtapeUpdate(etapeId, { typeId: 'asc' }, userSuper, titreId)
    getAvis = await restCall(dbPool, '/rest/etapes/:etapeId/etapeAvis', { etapeId: etapeId }, userSuper)
    expect(getAvis.statusCode).toBe(HTTP_STATUS.OK)
    expect(getAvis.body).toStrictEqual([])

    const avis: TempEtapeAvis = {
      avis_type_id: 'autreAvis',
      date: caminoDateValidator.parse('2023-02-01'),
      avis_statut_id: 'Favorable',
      description: 'Super',
      avis_visibility_id: AvisVisibilityIds.Administrations,
      temp_document_name: tempDocumentNameValidator.parse('fakeTempDocumentName'),
    }

    await expect(callAndExit(insertEtapeAvisWithLargeObjectId(dbPool, etapeId, { ...avis, description: '' }, etapeAvisIdValidator.parse('avisId'), largeObjectIdValidator.parse(42)))).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [Error: Impossible d'exécuter la requête dans la base de données
       extra: new row for relation "etape_avis" violates check constraint "etape_avis_description_required"
      detail: undefined
       zod: undefined]
    `)

    await callAndExit(insertEtapeAvisWithLargeObjectId(dbPool, etapeId, avis, etapeAvisIdValidator.parse('avisId'), largeObjectIdValidator.parse(42)))

    getAvis = await restCall(dbPool, '/rest/etapes/:etapeId/etapeAvis', { etapeId: etapeId }, userSuper)
    expect(getAvis.statusCode).toBe(HTTP_STATUS.OK)
    expect(getAvis.body).toMatchInlineSnapshot(`
      [
        {
          "avis_statut_id": "Favorable",
          "avis_type_id": "autreAvis",
          "avis_visibility_id": "Administrations",
          "date": "2023-02-01",
          "description": "Super",
          "has_file": true,
          "id": "avisId",
        },
      ]
    `)
  })
})
