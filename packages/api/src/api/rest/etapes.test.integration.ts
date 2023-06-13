import { dbManager } from '../../../tests/db-manager.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { restCall } from '../../../tests/_utils/index.js'
import { getCurrent, toCaminoDate } from 'camino-common/src/date.js'
import { afterAll, beforeAll, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { constants } from 'http2'
import { titreEtapeCreate } from '../../database/queries/titres-etapes.js'
import { dbQueryAndValidate } from '../../pg-database.js'
import { insertEntrepriseDocument } from './entreprises.queries.js'
import { EntrepriseDocumentId, entrepriseDocumentValidator, newEntrepriseId } from 'camino-common/src/entreprise.js'
import { newEnterpriseDocumentId } from '../../database/models/_format/id-create.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { DOCUMENTS_TYPES_IDS } from 'camino-common/src/static/documentsTypes.js'
import { insertTitreEtapeEntrepriseDocument } from '../../database/queries/titres-etapes.queries.js'
import { z } from 'zod'
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

  expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)
  expect(tested.body).toMatchInlineSnapshot(`
      [
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
        {
          "etapeStatutId": "aco",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "fai",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "aco",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "fai",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "aco",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "fai",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "aco",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "fai",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "aco",
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
      ]
    `)
})

test('getEtapeEntrepriseDocuments', async () => {
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

  const etape = await titreEtapeCreate(
    {
      typeId: 'mfr',
      date: toCaminoDate('2022-01-01'),
      statutId: 'fai',
      titreDemarcheId: titreDemarche.id,
    },
    userSuper,
    titre.id
  )

  const entrepriseId = newEntrepriseId('entreprise_id')

  await entrepriseUpsert({
    id: entrepriseId,
    nom: 'Mon Entreprise',
  })

  const id1: EntrepriseDocumentId = newEnterpriseDocumentId(toCaminoDate('2022-01-01'), 'kbi')

  await dbQueryAndValidate(
    insertEntrepriseDocument,
    { id: id1, date: toCaminoDate('2022-01-01'), description: '', entreprise_document_type_id: DOCUMENTS_TYPES_IDS.kbis, entreprise_id: entrepriseId },
    dbPool,
    entrepriseDocumentValidator.pick({ id: true })
  )

  let tested = await restCall(dbPool, '/rest/etapes/:etapeId/entrepriseDocuments', { etapeId: etape.id }, userSuper)

  expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)
  expect(tested.body).toEqual([])

  await dbQueryAndValidate(insertTitreEtapeEntrepriseDocument, { entreprise_document_id: id1, titre_etape_id: etape.id }, dbPool, z.void())

  tested = await restCall(dbPool, '/rest/etapes/:etapeId/entrepriseDocuments', { etapeId: etape.id }, { role: 'defaut' })

  expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)
  expect(tested.body).toEqual([])

  tested = await restCall(dbPool, '/rest/etapes/:etapeId/entrepriseDocuments', { etapeId: etape.id }, userSuper)

  expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)
  expect(tested.body).toHaveLength(1)
  expect(tested.body[0]).toMatchInlineSnapshot(
    {
      id: expect.anything(),
    },
    `
    {
      "date": "2022-01-01",
      "description": "",
      "entreprise_document_type_id": "kbi",
      "entreprise_id": "entreprise_id",
      "id": ${expect.anything()},
    }
  `
  )

  tested = await restCall(dbPool, '/rest/etapes/:etapeId/entrepriseDocuments', { etapeId: etape.id }, { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseId }] })

  expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)
  expect(tested.body).toHaveLength(1)
  expect(tested.body[0]).toMatchInlineSnapshot(
    {
      id: expect.anything(),
    },
    `
    {
      "date": "2022-01-01",
      "description": "",
      "entreprise_document_type_id": "kbi",
      "entreprise_id": "entreprise_id",
      "id": ${expect.anything()},
    }
  `
  )
})
