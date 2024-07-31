/* eslint-disable sql/no-unsafe-query */
import { dbManager } from '../../../tests/db-manager'
import { graphQLCall, queryImport } from '../../../tests/_utils/index'
import options from '../../database/queries/_options'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { ITitre } from '../../types'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create'
import { toCaminoDate } from 'camino-common/src/date'

import { vi, afterEach, afterAll, beforeAll, describe, test, expect } from 'vitest'
import type { Pool } from 'pg'
import { entrepriseUpsert } from '../../database/queries/entreprises'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { communeIdValidator } from 'camino-common/src/static/communes'
import type { Knex } from 'knex'
import Titres from '../../database/models/titres'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'

console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool
let knexStuff: Knex
beforeAll(async () => {
  const { pool, knex } = await dbManager.populateDb()
  dbPool = pool
  knexStuff = knex
})
afterEach(async () => {
  await dbManager.truncateSchema()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const titrePublicLectureFalse: ITitre = {
  id: newTitreId('titre-id'),
  nom: 'mon titre',
  typeId: 'arm',
  titreStatutId: 'ind',
  publicLecture: false,
  propsTitreEtapesIds: {},
}

const titreDemarchesPubliques: ITitre = {
  id: newTitreId('titre-id'),
  nom: 'mon titre',
  typeId: 'arm',
  titreStatutId: 'ind',
  publicLecture: true,
  propsTitreEtapesIds: {},
  demarches: [
    {
      id: newDemarcheId('titre-id-demarche-oct'),
      titreId: newTitreId('titre-id'),
      typeId: 'oct',
      publicLecture: true,
    },
    {
      id: newDemarcheId('titre-id-demarche-pro'),
      titreId: newTitreId('titre-id'),
      typeId: 'pro',
      publicLecture: false,
    },
  ],
}
const titreEtapesPubliques: ITitre = {
  id: newTitreId('titre-id'),
  nom: 'mon titre',
  typeId: 'arm',
  titreStatutId: 'ind',
  publicLecture: true,
  propsTitreEtapesIds: { points: 'titre-id-demarche-id-dpu' },
  demarches: [
    {
      id: newDemarcheId('titre-id-demarche-id'),
      titreId: newTitreId('titre-id'),
      typeId: 'oct',
      statutId: 'acc',
      publicLecture: true,
      etapes: [
        {
          id: newEtapeId('titre-id-demarche-id-asc'),
          typeId: 'asc',
          ordre: 8,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'fai',
          date: toCaminoDate('2020-02-02'),
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
        },
        {
          id: newEtapeId('titre-id-demarche-id-edm'),
          typeId: 'edm',
          ordre: 6,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
        },
        {
          id: newEtapeId('titre-id-demarche-id-ede'),
          typeId: 'ede',
          ordre: 5,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
        },
        {
          id: newEtapeId('titre-id-demarche-id-pfd'),
          typeId: 'pfd',
          ordre: 4,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
        },
        {
          id: newEtapeId('titre-id-demarche-id-pfc'),
          typeId: 'pfc',
          ordre: 3,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
        },
        {
          id: newEtapeId('titre-id-demarche-id-vfd'),
          typeId: 'vfd',
          ordre: 2,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
        },
        {
          id: newEtapeId('titre-id-demarche-id-vfc'),
          typeId: 'vfc',
          ordre: 1,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
        },
        {
          id: newEtapeId('titre-id-demarche-id-dpu'),
          typeId: 'dpu',
          ordre: 0,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
          administrationsLocales: ['dea-guyane-01'],
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
        },
      ],
    },
  ],
}

describe('titre', () => {
  const titreQuery = queryImport('titre')

  test('peut voir un titre qui est en "lecture publique" (utilisateur anonyme)', async () => {
    const titrePublicLecture: ITitre = {
      id: newTitreId('titre-id'),
      nom: 'mon titre',
      typeId: 'arm',
      titreStatutId: 'ind',
      publicLecture: true,
      propsTitreEtapesIds: {},
    }
    await Titres.query().upsertGraph(titrePublicLecture, options.titres.update)
    const res = await graphQLCall(dbPool, titreQuery, { id: 'titre-id' }, undefined)

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data.titres.elements[0]).toMatchObject({ id: 'titre-id' })
  })

  test('ne peut pas voir un titre qui n\'est pas en "lecture publique" (utilisateur anonyme)', async () => {
    await Titres.query().upsertGraph(titrePublicLectureFalse, options.titres.update)
    const res = await graphQLCall(dbPool, titreQuery, { id: 'titre-id' }, undefined)

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data.titres.elements[0]).toBeUndefined()
  })

  test('ne peut voir que les démarches qui sont en "lecture publique" (utilisateur anonyme)', async () => {
    await Titres.query().upsertGraph(titreDemarchesPubliques, options.titres.update)
    const res = await graphQLCall(dbPool, titreQuery, { id: 'titre-id' }, undefined)

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data.titres.elements[0]).toMatchObject({
      id: newTitreId('titre-id'),
      demarches: [{ id: 'titre-id-demarche-oct' }],
    })

    expect(res.body.data.titres.elements[0].demarches.length).toEqual(1)
  })

  test('ne peut voir que les étapes qui sont en "lecture publique" (utilisateur anonyme)', async () => {
    await Titres.query().upsertGraph(titreEtapesPubliques, options.titres.update)
    const res = await graphQLCall(dbPool, titreQuery, { id: 'titre-id' }, undefined)

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data.titres.elements[0]).toMatchObject({
      id: newTitreId('titre-id'),
      demarches: [
        {
          id: 'titre-id-demarche-id',
          etapes: [{ id: 'titre-id-demarche-id-dpu' }],
        },
      ],
    })
    expect(res.body.data.titres.elements[0].demarches[0].etapes.length).toEqual(1)
  })

  test('ne peut pas voir certaines étapes (utilisateur DGTM)', async () => {
    await Titres.query().upsertGraph(titreEtapesPubliques, options.titres.update)
    const res = await graphQLCall(dbPool, titreQuery, { id: 'titre-id' }, { role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] })

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data.titres.elements[0].demarches[0].etapes).toHaveLength(8)
    expect(
      res.body.data.titres.elements[0].demarches[0].etapes.map(({ id }: { id: string }) => ({
        id,
      }))
    ).toEqual(
      expect.arrayContaining([
        { id: 'titre-id-demarche-id-asc' },
        { id: 'titre-id-demarche-id-dpu' },
        { id: 'titre-id-demarche-id-ede' },
        { id: 'titre-id-demarche-id-edm' },
        { id: 'titre-id-demarche-id-pfc' },
        { id: 'titre-id-demarche-id-pfd' },
        { id: 'titre-id-demarche-id-vfc' },
        { id: 'titre-id-demarche-id-vfd' },
      ])
    )
  })

  test('ne peut pas voir certaines étapes (utilisateur ONF)', async () => {
    await Titres.query().upsertGraph(titreEtapesPubliques, options.titres.update)
    const res = await graphQLCall(
      dbPool,
      titreQuery,
      { id: 'titre-id' },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
      }
    )

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data.titres.elements[0].demarches[0].etapes.length).toEqual(1)
    expect(
      res.body.data.titres.elements[0].demarches[0].etapes.map(({ id }: { id: string }) => ({
        id,
      }))
    ).toEqual(expect.arrayContaining([{ id: 'titre-id-demarche-id-dpu' }]))
  })
})

// query TitresByEntrerise($entreprisesIds: [ID!]) {  titres(entreprisesIds: $entreprisesIds) { elements { id  } total }}
describe('titres', () => {
  const entrepriseId1 = newEntrepriseId('fr-12341234')
  const nomRef = 'MA_REF'
  const communeId = communeIdValidator.parse('31200')
  const titre: ITitre = {
    id: newTitreId('titre-id'),
    nom: 'mon titre',
    typeId: 'arm',
    titreStatutId: 'ind',
    references: [{ referenceTypeId: 'brg', nom: nomRef }],
    publicLecture: true,
    propsTitreEtapesIds: { titulaires: 'titre-id-demarche-id-dpu', points: 'titre-id-demarche-id-dpu' },
    demarches: [
      {
        id: newDemarcheId('titre-id-demarche-id'),
        titreId: newTitreId('titre-id'),
        typeId: 'oct',
        statutId: 'acc',
        publicLecture: true,
        etapes: [
          {
            id: newEtapeId('titre-id-demarche-id-dpu'),
            typeId: 'dpu',
            ordre: 0,
            titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
            statutId: 'acc',
            date: toCaminoDate('2020-02-02'),
            administrationsLocales: ['dea-guyane-01'],
            titulaireIds: [entrepriseId1],
            communes: [{ id: communeId }],
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
          },
        ],
      },
    ],
  }

  test('peut filtrer des titres par titulaires/amodiataires', async () => {
    await entrepriseUpsert({
      id: entrepriseId1,
      nom: `${entrepriseId1}`,
      etablissements: [],
      archive: false,
    })

    await Titres.query().upsertGraph(titre, options.titres.update)

    const res = await graphQLCall(
      dbPool,
      `query TitresByEntreprise($entreprisesIds: [ID]) {  titres(entreprisesIds: $entreprisesIds) { elements { id  } total }}`,
      { entreprisesIds: [entrepriseId1] },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
      }
    )

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data).toMatchInlineSnapshot(`
      {
        "titres": {
          "elements": [
            {
              "id": "titre-id",
            },
          ],
          "total": 1,
        },
      }
    `)
  })

  test('peut filtrer des titres par references', async () => {
    await entrepriseUpsert({
      id: entrepriseId1,
      nom: `${entrepriseId1}`,
      etablissements: [],
      archive: false,
    })

    await Titres.query().upsertGraph(titre, options.titres.update)

    const res = await graphQLCall(
      dbPool,
      `query TitresByReferences($references: String) {  titres(references: $references) { elements { id  } total }}`,
      { references: nomRef },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
      }
    )

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data).toMatchInlineSnapshot(`
      {
        "titres": {
          "elements": [
            {
              "id": "titre-id",
            },
          ],
          "total": 1,
        },
      }
    `)
  })

  test('peut filtrer des titres par communes', async () => {
    await entrepriseUpsert({
      id: entrepriseId1,
      nom: `${entrepriseId1}`,
      etablissements: [],
      archive: false,
    })

    const nomCommune = 'NOM DE COMMUNE'

    await Titres.query().upsertGraph(titre, options.titres.update)
    await knexStuff.raw(`insert into communes (id, nom, geometry) values ('${communeId}', '${nomCommune}', '010100000000000000000000000000000000000000')`)

    const res = await graphQLCall(
      dbPool,
      `query TitresByCommunes($communes: String) {  titres(communes: $communes) { elements { id  } total }}`,
      { communes: nomCommune },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
      }
    )

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data).toMatchInlineSnapshot(`
      {
        "titres": {
          "elements": [
            {
              "id": "titre-id",
            },
          ],
          "total": 1,
        },
      }
    `)
  })
})
