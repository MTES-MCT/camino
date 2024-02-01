/* eslint-disable sql/no-unsafe-query */
import { dbManager } from '../../../tests/db-manager.js'
import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'
import { titreCreate } from '../../database/queries/titres.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { ITitre } from '../../types.js'
import { userSuper } from '../../database/user-super'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create.js'
import { toCaminoDate } from 'camino-common/src/date.js'

import { vi, afterEach, afterAll, beforeAll, describe, test, expect } from 'vitest'
import type { Pool } from 'pg'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { communeIdValidator } from 'camino-common/src/static/communes.js'
import type { Knex } from 'knex'

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
  await dbManager.reseedDb()
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
          id: newEtapeId('titre-id-demarche-id-aof'),
          typeId: 'aof',
          ordre: 8,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
        },
        {
          id: newEtapeId('titre-id-demarche-id-eof'),
          typeId: 'eof',
          ordre: 7,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
        },
        {
          id: newEtapeId('titre-id-demarche-id-edm'),
          typeId: 'edm',
          ordre: 6,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
        },
        {
          id: newEtapeId('titre-id-demarche-id-ede'),
          typeId: 'ede',
          ordre: 5,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
        },
        {
          id: newEtapeId('titre-id-demarche-id-pfd'),
          typeId: 'pfd',
          ordre: 4,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
        },
        {
          id: newEtapeId('titre-id-demarche-id-pfc'),
          typeId: 'pfc',
          ordre: 3,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
        },
        {
          id: newEtapeId('titre-id-demarche-id-vfd'),
          typeId: 'vfd',
          ordre: 2,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
        },
        {
          id: newEtapeId('titre-id-demarche-id-vfc'),
          typeId: 'vfc',
          ordre: 1,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
        },
        {
          id: newEtapeId('titre-id-demarche-id-dpu'),
          typeId: 'dpu',
          ordre: 0,
          titreDemarcheId: newDemarcheId('titre-id-demarche-id'),
          statutId: 'acc',
          date: toCaminoDate('2020-02-02'),
          administrationsLocales: ['dea-guyane-01'],
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
    await titreCreate(titrePublicLecture, {})
    const res = await graphQLCall(dbPool, titreQuery, { id: 'titre-id' }, undefined)

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data).toMatchObject({
      titre: { id: 'titre-id' },
    })
  })

  test('ne peut pas voir un titre qui n\'est pas en "lecture publique" (utilisateur anonyme)', async () => {
    await titreCreate(titrePublicLectureFalse, {})
    const res = await graphQLCall(dbPool, titreQuery, { id: 'titre-id' }, undefined)

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data).toMatchObject({ titre: null })
  })

  test('ne peut voir que les démarches qui sont en "lecture publique" (utilisateur anonyme)', async () => {
    await titreCreate(titreDemarchesPubliques, {})
    const res = await graphQLCall(dbPool, titreQuery, { id: 'titre-id' }, undefined)

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data).toMatchObject({
      titre: {
        id: newTitreId('titre-id'),
        demarches: [{ id: 'titre-id-demarche-oct' }],
      },
    })

    expect(res.body.data.titre.demarches.length).toEqual(1)
  })

  test('ne peut voir que les étapes qui sont en "lecture publique" (utilisateur anonyme)', async () => {
    await titreCreate(titreEtapesPubliques, {})
    const res = await graphQLCall(dbPool, titreQuery, { id: 'titre-id' }, undefined)

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data).toMatchObject({
      titre: {
        id: newTitreId('titre-id'),
        demarches: [
          {
            id: 'titre-id-demarche-id',
            etapes: [{ id: 'titre-id-demarche-id-dpu' }],
          },
        ],
      },
    })
    expect(res.body.data.titre.demarches[0].etapes.length).toEqual(1)
  })

  test('ne peut pas voir certaines étapes (utilisateur DGTM)', async () => {
    await titreCreate(titreEtapesPubliques, {})
    const res = await graphQLCall(dbPool, titreQuery, { id: 'titre-id' }, { role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] })

    expect(res.body.errors).toBe(undefined)
    expect(res.body.data.titre.demarches[0].etapes).toHaveLength(8)
    expect(
      res.body.data.titre.demarches[0].etapes.map(({ id }: { id: string }) => ({
        id,
      }))
    ).toEqual(
      expect.arrayContaining([
        { id: 'titre-id-demarche-id-aof' },
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
    await titreCreate(titreEtapesPubliques, {})
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
    expect(res.body.data.titre.demarches[0].etapes.length).toEqual(9)
    expect(
      res.body.data.titre.demarches[0].etapes.map(({ id }: { id: string }) => ({
        id,
      }))
    ).toEqual(
      expect.arrayContaining([
        { id: 'titre-id-demarche-id-aof' },
        { id: 'titre-id-demarche-id-eof' },
        { id: 'titre-id-demarche-id-edm' },
        { id: 'titre-id-demarche-id-pfc' },
        { id: 'titre-id-demarche-id-pfd' },
        { id: 'titre-id-demarche-id-vfc' },
        { id: 'titre-id-demarche-id-vfd' },
        { id: 'titre-id-demarche-id-ede' },
        { id: 'titre-id-demarche-id-dpu' },
      ])
    )
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
            titulaires: [{ id: entrepriseId1 }],
            communes: [{ id: communeId }],
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

    await titreCreate(titre, {})

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

    await titreCreate(titre, {})

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

    await titreCreate(titre, {})
    await knexStuff.raw(`insert into communes (id, nom) values ('${communeId}', '${nomCommune}')`)

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

describe('titreCreer', () => {
  const titreCreerQuery = queryImport('titre-creer')

  test('ne peut pas créer un titre (utilisateur anonyme)', async () => {
    const res = await graphQLCall(
      dbPool,
      titreCreerQuery,
      {
        titre: { nom: 'titre', typeId: 'arm' },
      },
      undefined
    )

    expect(res.body.errors[0].message).toBe('permissions insuffisantes')
  })

  test("ne peut pas créer un titre prm (un utilisateur 'entreprise')", async () => {
    const res = await graphQLCall(dbPool, titreCreerQuery, { titre: { nom: 'titre', typeId: 'prm' } }, { role: 'entreprise', entreprises: [] })

    expect(res.body.errors[0].message).toBe('permissions insuffisantes')
  })

  test("crée un titre (un utilisateur 'super')", async () => {
    const res = await graphQLCall(dbPool, titreCreerQuery, { titre: { nom: 'titre', typeId: 'arm' } }, userSuper)

    expect(res.body.errors).toBe(undefined)
    expect(res.body).toMatchObject({
      data: { titreCreer: { slug: 'm-ar-titre-0000', nom: 'titre' } },
    })
  })

  test("ne peut pas créer un titre AXM (un utilisateur 'admin' PTMG)", async () => {
    const res = await graphQLCall(
      dbPool,
      titreCreerQuery,
      { titre: { nom: 'titre', typeId: 'axm' } },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors[0].message).toBe('permissions insuffisantes')
  })

  test("ne peut pas créer un titre ARM (un utilisateur 'admin' Déal Guyane)", async () => {
    const res = await graphQLCall(dbPool, titreCreerQuery, { titre: { nom: 'titre', typeId: 'arm' } }, { role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] })

    expect(res.body.errors[0].message).toBe('permissions insuffisantes')
  })

  test("crée un titre ARM (un utilisateur 'admin' PTMG)", async () => {
    const res = await graphQLCall(
      dbPool,
      titreCreerQuery,
      { titre: { nom: 'titre', typeId: 'arm' } },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors).toBe(undefined)
    expect(res.body).toMatchObject({
      data: { titreCreer: { slug: 'm-ar-titre-0000', nom: 'titre' } },
    })
  })
})
