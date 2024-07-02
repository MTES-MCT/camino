import { dbManager } from '../../../tests/db-manager.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { restCall, restDeleteCall } from '../../../tests/_utils/index.js'
import { caminoDateValidator, getCurrent, toCaminoDate } from 'camino-common/src/date.js'
import { afterAll, beforeAll, test, expect, describe, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { Role, isAdministrationRole } from 'camino-common/src/roles.js'
import { titreEtapeCreate, titreEtapeUpdate } from '../../database/queries/titres-etapes.js'
import { entrepriseIdValidator } from 'camino-common/src/entreprise.js'
import { TestUser, testBlankUser } from 'camino-common/src/tests-utils.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { Knex } from 'knex'
import { ETAPE_IS_BROUILLON, etapeAvisIdValidator } from 'camino-common/src/etape.js'
import { insertEtapeAvisWithLargeObjectId } from '../../database/queries/titres-etapes.queries.js'
import { largeObjectIdValidator } from '../../database/largeobjects.js'
import { AvisVisibilityIds } from 'camino-common/src/static/avisTypes.js'
import { tempDocumentNameValidator } from 'camino-common/src/document.js'

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
  test('nouvelle étapes possibles', async () => {
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
    // TODO 2024-06-19 changer ce format ?
    // Partir plutôt sur un object avec comme clé le etapeTypeId, une liste de etapeStatut associée et la clé mainStep (soit sur le statut, soit directement au top niveau)
    // soit { mfr: {statuts: ['fai'], mainStep: true}}
    // soit { mfr: {statuts: [{id: 'fai', mainStep: true}]}}
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
  test('nouvelle étapes possibles prends en compte les brouillons', async () => {
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

    await titreEtapeCreate(
      {
        typeId: 'mfr',
        date: toCaminoDate('2024-06-27'),
        titreDemarcheId: titreDemarche.id,
        statutId: 'fai',
        isBrouillon: ETAPE_IS_BROUILLON,
      },
      userSuper,
      titre.id
    )

    const tested = await restCall(dbPool, '/rest/etapesTypes/:demarcheId/:date', { demarcheId: titreDemarche.id, date: getCurrent() }, userSuper)

    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    expect(tested.body).toMatchInlineSnapshot(`
        [
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
    const tested = await restDeleteCall(
      dbPool,
      '/rest/etapes/:etapeIdOrSlug',
      { etapeIdOrSlug: titreEtape.id },
      role && isAdministrationRole(role) ? { role, administrationId: 'min-mctrct-dgcl-01' } : undefined
    )

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
    const tested = await restDeleteCall(dbPool, '/rest/etapes/:etapeIdOrSlug', { etapeIdOrSlug: titreEtape.id }, userSuper)

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
        isBrouillon: ETAPE_IS_BROUILLON,
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
      entreprises: [{ id: titulaireId1 }],
    }

    const getEtape = await restCall(dbPool, '/rest/titres/:titreId', { titreId: titre.id }, user)
    expect(getEtape.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)

    const tested = await restDeleteCall(dbPool, '/rest/etapes/:etapeIdOrSlug', { etapeIdOrSlug: titreEtape.id }, user)

    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  })
})

describe('getEtapeAvis', () => {
  test('test la récupération des avis', async () => {
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

    let getAvis = await restCall(dbPool, '/rest/etapes/:etapeId/etapeAvis', { etapeId: titreEtape.id }, userSuper)
    expect(getAvis.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    expect(getAvis.body).toStrictEqual([])

    await titreEtapeUpdate(titreEtape.id, { typeId: 'asc' }, userSuper, titre.id)
    getAvis = await restCall(dbPool, '/rest/etapes/:etapeId/etapeAvis', { etapeId: titreEtape.id }, userSuper)
    expect(getAvis.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    expect(getAvis.body).toStrictEqual([])

    await insertEtapeAvisWithLargeObjectId(
      dbPool,
      titreEtape.id,
      {
        avis_type_id: 'autreAvis',
        date: caminoDateValidator.parse('2023-02-01'),
        avis_statut_id: 'Favorable',
        description: 'Super',
        avis_visibility_id: AvisVisibilityIds.Administrations,
        temp_document_name: tempDocumentNameValidator.parse('fakeTempDocumentName'),
      },
      etapeAvisIdValidator.parse('avisId'),
      largeObjectIdValidator.parse(42)
    )
    getAvis = await restCall(dbPool, '/rest/etapes/:etapeId/etapeAvis', { etapeId: titreEtape.id }, userSuper)
    expect(getAvis.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
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
