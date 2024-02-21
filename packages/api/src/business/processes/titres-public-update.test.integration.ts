/* eslint-disable sql/no-unsafe-query */
import { expect, test, afterAll, beforeAll, vi, describe } from 'vitest'
import type { Pool } from 'pg'
import { dbManager } from '../../../tests/db-manager'
import { Knex } from 'knex'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { titresPublicUpdate } from './titres-public-update'
import { demarcheIdValidator } from 'camino-common/src/demarche'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'

console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool
let knex: Knex

beforeAll(async () => {
  const { pool, knex: knexInstance } = await dbManager.populateDb()
  knex = knexInstance
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('titresPublicUpdate', () => {
  test("met à jour la publicité d'un titre", async () => {
    const titreId = titreIdValidator.parse('titreId')
    await knex.raw(
      `insert into titres (id, type_id, titre_statut_id, public_lecture, nom, slug) values ('${titreId}', '${TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE}', '${TitresStatutIds.Valide}', true, 'nomDuTitre', 'slug')`
    )

    let titresPublicUpdated = await titresPublicUpdate(dbPool, [titreId])
    expect(titresPublicUpdated.length).toEqual(1)

    titresPublicUpdated = await titresPublicUpdate(dbPool, [titreId])
    expect(titresPublicUpdated.length).toEqual(0)

    await knex.raw(
      `insert into titres_demarches (id, titre_id, public_lecture, type_id) values ('${demarcheIdValidator.parse('demarcheIdNonPublic')}', '${titreId}', false, '${DEMARCHES_TYPES_IDS.Octroi}')`
    )

    titresPublicUpdated = await titresPublicUpdate(dbPool, [titreId])
    expect(titresPublicUpdated.length).toEqual(0)

    await knex.raw(
      `insert into titres_demarches (id, titre_id, public_lecture, type_id, archive) values ('${demarcheIdValidator.parse('demarcheIdArchived')}', '${titreId}', true, '${
        DEMARCHES_TYPES_IDS.Octroi
      }', true)`
    )

    titresPublicUpdated = await titresPublicUpdate(dbPool, [titreId])
    expect(titresPublicUpdated.length).toEqual(0)

    await knex.raw(
      `insert into titres_demarches (id, titre_id, public_lecture, type_id) values ('${demarcheIdValidator.parse('demarcheIdPublic')}', '${titreId}', true, '${DEMARCHES_TYPES_IDS.Octroi}')`
    )

    titresPublicUpdated = await titresPublicUpdate(dbPool, [titreId])
    expect(titresPublicUpdated.length).toEqual(1)
  })

  test('met à jour la publicité de tous les titres', async () => {
    await knex.raw(
      `insert into titres (id, type_id, titre_statut_id, public_lecture, nom, slug) values ('${titreIdValidator.parse('titreId1')}', '${TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE}', '${
        TitresStatutIds.Valide
      }', true, 'nomDuTitre', 'slug')`
    )
    await knex.raw(
      `insert into titres (id, type_id, titre_statut_id, public_lecture, nom, slug) values ('${titreIdValidator.parse('titreId2')}', '${TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE}', '${
        TitresStatutIds.Valide
      }', true, 'nomDuTitre', 'slug')`
    )

    let titresPublicUpdated = await titresPublicUpdate(dbPool)
    expect(titresPublicUpdated.length).toEqual(2)

    titresPublicUpdated = await titresPublicUpdate(dbPool)
    expect(titresPublicUpdated.length).toEqual(0)
  })
})
