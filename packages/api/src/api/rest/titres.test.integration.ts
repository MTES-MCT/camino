import { dbManager } from '../../../tests/db-manager.js'
import { titreCreate, titreUpdate } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreEtapeCreate } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { restCall, restDeleteCall, restPostCall } from '../../../tests/_utils/index.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { ITitreDemarche, ITitreEtape } from '../../types.js'
import { entreprisesUpsert } from '../../database/queries/entreprises.js'
import { Knex } from 'knex'
import { getCurrent, toCaminoDate } from 'camino-common/src/date.js'
import { afterAll, beforeAll, beforeEach, describe, test, expect, vi } from 'vitest'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'
import type { Pool } from 'pg'
import { createJournalCreate } from '../../database/queries/journaux.js'
import { idGenerate } from '../../database/models/_format/id-create.js'
import { constants } from 'http2'

console.info = vi.fn()
console.error = vi.fn()

let knex: Knex<any, unknown[]>
let dbPool: Pool
beforeAll(async () => {
  const { knex: knexInstance, pool } = await dbManager.populateDb()
  dbPool = pool
  knex = knexInstance

  const entreprises = await entreprisesUpsert([{ id: newEntrepriseId('plop'), nom: 'Mon Entreprise' }])
  await titreCreate(
    {
      nom: 'mon titre simple',
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
    },
    {}
  )

  await createTitreWithEtapes(
    'titre1',
    [
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: toCaminoDate('2022-01-01'),
        ordre: 0,
      },
      {
        typeId: 'mdp',
        statutId: 'fai',
        date: toCaminoDate('2022-02-01'),
        ordre: 1,
      },
      {
        typeId: 'pfd',
        statutId: 'fai',
        date: toCaminoDate('2022-02-10'),
        ordre: 2,
      },
      {
        typeId: 'mcp',
        statutId: 'com',
        date: toCaminoDate('2022-03-10'),
        ordre: 3,
      },
    ],
    entreprises
  )
  await createTitreWithEtapes(
    'titre2',
    [
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: toCaminoDate('2022-01-01'),
        ordre: 0,
      },
      {
        typeId: 'mdp',
        statutId: 'fai',
        date: toCaminoDate('2022-02-01'),
        ordre: 1,
      },
      {
        typeId: 'pfd',
        statutId: 'fai',
        date: toCaminoDate('2022-02-10'),
        ordre: 2,
      },
    ],
    entreprises
  )
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const titreEtapesCreate = async (demarche: ITitreDemarche, etapes: Omit<ITitreEtape, 'id' | 'titreDemarcheId'>[]) => {
  const etapesCrees = []
  for (const etape of etapes) {
    etapesCrees.push(
      await titreEtapeCreate(
        {
          ...etape,
          titreDemarcheId: demarche.id,
        },
        userSuper,
        demarche.titreId
      )
    )
  }

  return etapesCrees
}

async function createTitreWithEtapes(nomTitre: string, etapes: Omit<ITitreEtape, 'id' | 'titreDemarcheId'>[], entreprises: any) {
  const titre = await titreCreate(
    {
      nom: nomTitre,
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
      references: [
        {
          referenceTypeId: 'onf',
          nom: 'ONF',
        },
      ],
    },
    {}
  )

  const titreDemarche = await titreDemarcheCreate({
    titreId: titre.id,
    typeId: 'oct',
  })
  const etapesCrees = await titreEtapesCreate(titreDemarche, etapes)

  await knex('titresTitulaires').insert({
    titreEtapeId: etapesCrees[0].id,
    entrepriseId: entreprises[0].id,
  })

  await knex('titres')
    .update({ propsTitreEtapesIds: { titulaires: etapesCrees[0].id } })
    .where('id', titre.id)
}

describe('titresONF', () => {
  test("teste la récupération des données pour l'ONF", async () => {
    const tested = await restCall(
      dbPool,
      CaminoRestRoutes.titresONF,
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
      }
    )

    expect(tested.statusCode).toBe(200)
    expect(tested.body).toHaveLength(2)
    expect(tested.body[0]).toMatchSnapshot({
      id: expect.any(String),
      slug: expect.any(String),
    })
    expect(tested.body[1]).toMatchSnapshot({
      id: expect.any(String),
      slug: expect.any(String),
    })
  })
})

describe('titresPTMG', () => {
  test('teste la récupération des données pour le PTMG', async () => {
    const tested = await restCall(
      dbPool,
      CaminoRestRoutes.titresPTMG,
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(tested.statusCode).toBe(200)
    expect(tested.body).toHaveLength(2)
    expect(tested.body[0]).toMatchSnapshot({
      id: expect.any(String),
      slug: expect.any(String),
    })
    expect(tested.body[1]).toMatchSnapshot({
      id: expect.any(String),
      slug: expect.any(String),
    })
  })
})
describe('titresLiaisons', () => {
  test('peut lier deux titres', async () => {
    const getTitres = await restCall(
      dbPool,
      CaminoRestRoutes.titresONF,
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
      }
    )
    const titreId = getTitres.body[0].id

    const axm = await titreCreate(
      {
        nom: 'mon axm simple',
        typeId: 'axm',
        titreStatutId: 'val',
        propsTitreEtapesIds: {},
      },
      {}
    )

    const tested = await restPostCall(
      dbPool,
      CaminoRestRoutes.titresLiaisons,
      { id: axm.id },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
      },
      [titreId]
    )

    expect(tested.statusCode).toBe(200)
    expect(tested.body.amont).toHaveLength(1)
    expect(tested.body.aval).toHaveLength(0)
    expect(tested.body.amont[0]).toStrictEqual({
      id: titreId,
      nom: getTitres.body[0].nom,
    })

    const avalTested = await restCall(
      dbPool,
      CaminoRestRoutes.titresLiaisons,
      { id: titreId },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
      }
    )

    expect(avalTested.statusCode).toBe(200)
    expect(avalTested.body.amont).toHaveLength(0)
    expect(avalTested.body.aval).toHaveLength(1)
    expect(avalTested.body.aval[0]).toStrictEqual({
      id: axm.id,
      nom: axm.nom,
    })
  })
})

describe('titreModifier', () => {
  let id = ''

  beforeEach(async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        typeId: 'arm',
        propsTitreEtapesIds: {},
      },
      {}
    )
    id = titre.id
  })

  test('ne peut pas modifier un titre (utilisateur anonyme)', async () => {
    const tested = await restPostCall(dbPool, CaminoRestRoutes.titre, { titreId: id }, undefined, { id, nom: 'mon titre modifié', references: [] })

    expect(tested.statusCode).toBe(404)
  })

  test("ne peut pas modifier un titre (un utilisateur 'entreprise')", async () => {
    const tested = await restPostCall(dbPool, CaminoRestRoutes.titre, { titreId: id }, { role: 'entreprise', entreprises: [] }, { id, nom: 'mon titre modifié', references: [] })

    expect(tested.statusCode).toBe(404)
  })

  test('modifie un titre (un utilisateur userSuper)', async () => {
    const tested = await restPostCall(dbPool, CaminoRestRoutes.titre, { titreId: id }, { role: 'super' }, { id, nom: 'mon titre modifié', references: [] })
    expect(tested.statusCode).toBe(204)
  })

  test("modifie un titre ARM (un utilisateur 'admin' PTMG)", async () => {
    const tested = await restPostCall(
      dbPool,
      CaminoRestRoutes.titre,
      { titreId: id },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      },
      { id, nom: 'mon titre modifié', references: [] }
    )
    expect(tested.statusCode).toBe(204)
  })

  test("ne peut pas modifier un titre ARM échu (un utilisateur 'admin' PTMG)", async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre échu',
        typeId: 'arm',
        titreStatutId: 'ech',
        propsTitreEtapesIds: {},
      },
      {}
    )

    const tested = await restPostCall(
      dbPool,
      CaminoRestRoutes.titre,
      { titreId: titre.id },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      },
      { id: titre.id, nom: 'mon titre modifié', references: [] }
    )
    expect(tested.statusCode).toBe(403)
  })

  test("ne peut pas modifier un titre ARM (un utilisateur 'admin' DGTM)", async () => {
    const tested = await restPostCall(
      dbPool,
      CaminoRestRoutes.titre,
      { titreId: id },
      { role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] },
      { id, nom: 'mon titre modifié', references: [] }
    )
    expect(tested.statusCode).toBe(403)
  })
})

describe('titreSupprimer', () => {
  let id = ''

  beforeEach(async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        typeId: 'arm',
        propsTitreEtapesIds: {},
      },
      {}
    )
    id = titre.id
  })

  test('ne peut pas supprimer un titre (utilisateur anonyme)', async () => {
    const tested = await restDeleteCall(dbPool, CaminoRestRoutes.titre, { titreId: id }, undefined)

    expect(tested.statusCode).toBe(404)
  })

  test('peut supprimer un titre (utilisateur super)', async () => {
    const tested = await restDeleteCall(dbPool, CaminoRestRoutes.titre, { titreId: id }, userSuper)

    expect(tested.statusCode).toBe(204)
  })

  test('ne peut pas supprimer un titre inexistant (utilisateur super)', async () => {
    const tested = await restDeleteCall(dbPool, CaminoRestRoutes.titre, { titreId: 'toto' }, userSuper)
    expect(tested.statusCode).toBe(404)
  })
})

describe('getTitre', () => {
  test('ne peut pas récupérer un titre (utilisateur non super)', async () => {
    const tested = await restCall(dbPool, CaminoRestRoutes.titre, { titreId: 'not existing' }, undefined)

    expect(tested.statusCode).toBe(403)
  })

  test('ne peut pas récupérer un titre inexistant', async () => {
    const tested = await restCall(dbPool, CaminoRestRoutes.titre, { titreId: 'not existing' }, userSuper)

    expect(tested.statusCode).toBe(404)
  })

  test('peut récupérer un titre', async () => {
    const titre = await titreCreate(
      {
        nom: 'mon nouveau titre',
        typeId: 'arm',
        slug: 'arm-slug',
        propsTitreEtapesIds: {},
      },
      {}
    )

    const tested = await restCall(dbPool, CaminoRestRoutes.titre, { titreId: titre.id }, userSuper)

    expect(tested.statusCode).toBe(200)
    expect(tested.body).toEqual({
      id: titre.id,
      type_id: 'arm',
      slug: 'arm-slug',
      nom: 'mon nouveau titre',
      titre_statut_id: 'ind',
      administrations_locales: [],
    })
  })
  test('peut récupérer un titre avec des administrations locales', async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        typeId: 'arm',
        slug: 'slug',
        titreStatutId: 'val',
        propsTitreEtapesIds: {},
      },
      {}
    )

    const titreDemarche = await titreDemarcheCreate({
      titreId: titre.id,
      typeId: 'oct',
    })

    const etapesCrees = await titreEtapesCreate(titreDemarche, [
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: toCaminoDate('2022-01-01'),
        ordre: 0,
        administrationsLocales: ['aut-97300-01', 'aut-mrae-guyane-01'],
      },
    ])

    await titreUpdate(titre.id, { propsTitreEtapesIds: { points: etapesCrees[0].id } })

    const tested = await restCall(dbPool, CaminoRestRoutes.titre, { titreId: titre.id }, userSuper)

    expect(tested.statusCode).toBe(200)
    expect(tested.body).toEqual({
      id: titre.id,
      type_id: 'arm',
      slug: 'slug',
      nom: 'mon titre',
      titre_statut_id: 'val',
      administrations_locales: ['aut-97300-01', 'aut-mrae-guyane-01'],
    })
  })
})

test('getTitreDate', async () => {
  const titre = await titreCreate(
    {
      nom: 'mon autre titre',
      typeId: 'arm',
      slug: 'slug',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
    },
    {}
  )

  let tested = await restCall(dbPool, CaminoRestRoutes.titreDate, { titreId: titre.id }, userSuper)

  expect(tested.statusCode).toBe(constants.HTTP_STATUS_NO_CONTENT)
  await createJournalCreate(idGenerate(), userSuper.id, titre.id)

  tested = await restCall(dbPool, CaminoRestRoutes.titreDate, { titreId: titre.id }, userSuper)

  expect(tested.body).toBe(getCurrent())
})
