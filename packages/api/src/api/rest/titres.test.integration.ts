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
import { toCaminoDate } from 'camino-common/src/date.js'
import { afterAll, beforeAll, beforeEach, describe, test, expect, vi } from 'vitest'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import type { Pool } from 'pg'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { toCommuneId } from 'camino-common/src/static/communes.js'
import { insertCommune } from '../../database/queries/communes.queries.js'
import { titreSlugValidator } from 'camino-common/src/validators/titres.js'
import TitresDemarches from '../../database/models/titres-demarches.js'
import TitresEtapes from '../../database/models/titres-etapes.js'
import Titres from '../../database/models/titres.js'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape.js'

console.info = vi.fn()
console.error = vi.fn()

let knex: Knex<any, unknown[]>
let dbPool: Pool
beforeAll(async () => {
  const { knex: knexInstance, pool } = await dbManager.populateDb()
  dbPool = pool
  knex = knexInstance

  await insertCommune(pool, { id: toCommuneId('97300'), nom: 'Une ville en Guyane' })
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-01-01'),
        ordre: 0,
        administrationsLocales: [ADMINISTRATION_IDS['DGTM - GUYANE']],
        communes: [{ id: toCommuneId('97300'), surface: 12 }],
      },
      {
        typeId: 'mdp',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-02-01'),
        ordre: 1,
      },
      {
        typeId: 'pfd',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-02-10'),
        ordre: 2,
      },
      {
        typeId: 'mcp',
        statutId: 'com',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-01-01'),
        ordre: 0,
        administrationsLocales: [ADMINISTRATION_IDS['DGTM - GUYANE']],
      },
      {
        typeId: 'mdp',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-02-01'),
        ordre: 1,
      },
      {
        typeId: 'pfd',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      titreStatutId: 'mod',
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

  const [firstEtape, ...remainingEtapes] = etapes

  const etapesCrees = await titreEtapesCreate(titreDemarche, [{ ...firstEtape, titulaireIds: [entreprises[0].id] }, ...remainingEtapes])

  await knex('titres')
    .update({ propsTitreEtapesIds: { titulaires: etapesCrees[0].id, points: etapesCrees[0].id } })
    .where('id', titre.id)

  return titre.id
}

describe('titresONF', () => {
  test("teste la récupération des données pour l'ONF", async () => {
    const tested = await restCall(
      dbPool,
      '/rest/titresONF',
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

describe('titresAdministration', () => {
  test('teste la récupération des données pour les Administrations', async () => {
    const tested = await restCall(
      dbPool,
      '/rest/titresAdministrations',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
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
      '/rest/titresONF',
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
      '/rest/titres/:id/titreLiaisons',
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
      '/rest/titres/:id/titreLiaisons',
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
  let id = newTitreId('')

  beforeEach(async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        typeId: 'arm',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
      },
      {}
    )
    id = titre.id
  })

  test('ne peut pas modifier un titre (utilisateur anonyme)', async () => {
    const tested = await restPostCall(dbPool, '/rest/titres/:titreId', { titreId: id }, undefined, { id, nom: 'mon titre modifié', references: [] })

    expect(tested.statusCode).toBe(403)
  })

  test("ne peut pas modifier un titre (un utilisateur 'entreprise')", async () => {
    const tested = await restPostCall(dbPool, '/rest/titres/:titreId', { titreId: id }, { role: 'entreprise', entreprises: [] }, { id, nom: 'mon titre modifié', references: [] })

    expect(tested.statusCode).toBe(404)
  })

  test('modifie un titre (un utilisateur userSuper)', async () => {
    const tested = await restPostCall(dbPool, '/rest/titres/:titreId', { titreId: id }, { role: 'super' }, { id, nom: 'mon titre modifié', references: [] })
    expect(tested.statusCode).toBe(204)
  })

  test("modifie un titre ARM (un utilisateur 'admin' PTMG)", async () => {
    const tested = await restPostCall(
      dbPool,
      '/rest/titres/:titreId',
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
      '/rest/titres/:titreId',
      { titreId: titre.id },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      },
      { id: titre.id, nom: 'mon titre modifié', references: [] }
    )
    expect(tested.statusCode).toBe(403)
  })

  test("ne peut pas modifier un titre ARM (un utilisateur 'admin' DGCL/SDFLAE/FL1)", async () => {
    const tested = await restPostCall(
      dbPool,
      '/rest/titres/:titreId',
      { titreId: id },
      { role: 'admin', administrationId: ADMINISTRATION_IDS['DGCL/SDFLAE/FL1'] },
      { id, nom: 'mon titre modifié', references: [] }
    )
    expect(tested.statusCode).toBe(403)
  })
})

describe('titreSupprimer', () => {
  let id = newTitreId('')

  beforeEach(async () => {
    const titre = await titreCreate(
      {
        nom: 'mon titre',
        typeId: 'arm',
        titreStatutId: 'ind',
        propsTitreEtapesIds: {},
      },
      {}
    )
    id = titre.id
  })

  test('ne peut pas supprimer un titre (utilisateur anonyme)', async () => {
    const tested = await restDeleteCall(dbPool, '/rest/titres/:titreId', { titreId: id }, undefined)

    expect(tested.statusCode).toBe(403)
  })

  test('peut supprimer un titre (utilisateur super)', async () => {
    const tested = await restDeleteCall(dbPool, '/rest/titres/:titreId', { titreId: id }, userSuper)

    expect(tested.statusCode).toBe(204)
  })

  test('ne peut pas supprimer un titre inexistant (utilisateur super)', async () => {
    const tested = await restDeleteCall(dbPool, '/rest/titres/:titreId', { titreId: newTitreId('toto') }, userSuper)
    expect(tested.statusCode).toBe(404)
  })
})

describe('getTitre', () => {
  test('ne peut pas récupérer un titre inexistant', async () => {
    const tested = await restCall(dbPool, '/rest/titres/:titreId', { titreId: newTitreId('not existing') }, userSuper)

    expect(tested.statusCode).toBe(404)
  })

  test('peut récupérer un titre', async () => {
    const titreId = newTitreId('other-titre-id')
    await Titres.query().insert({
      id: titreId,
      nom: 'mon nouveau titre',
      typeId: 'arm',
      titreStatutId: 'ind',
      slug: titreSlugValidator.parse('arm-slug'),
      propsTitreEtapesIds: {},
      archive: false,
    })

    const tested = await restCall(dbPool, '/rest/titres/:titreId', { titreId }, userSuper)

    expect(tested.statusCode).toBe(200)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "demarches": [],
        "id": "other-titre-id",
        "nb_activites_to_do": null,
        "nom": "mon nouveau titre",
        "references": [],
        "slug": "arm-slug",
        "titre_doublon": null,
        "titre_last_modified_date": null,
        "titre_statut_id": "ind",
        "titre_type_id": "arm",
      }
    `)
  })
  test('ne peut pas récupérer un titre archivé', async () => {
    const titreId = newTitreId('archive-titre-id')
    await Titres.query().insert({
      id: titreId,
      nom: 'mon nouveau titre',
      typeId: 'arm',
      titreStatutId: 'ind',
      slug: titreSlugValidator.parse('arm-slug'),
      propsTitreEtapesIds: {},
      archive: true,
    })

    const tested = await restCall(dbPool, '/rest/titres/:titreId', { titreId }, userSuper)

    expect(tested.statusCode).toBe(404)
    expect(tested.body).toMatchInlineSnapshot(`{}`)
  })

  test('peut récupérer un titre avec des administrations locales', async () => {
    const titreId = newTitreId('titre-id')
    await Titres.query().insert({
      id: titreId,
      nom: 'mon titre',
      typeId: 'arm',
      slug: titreSlugValidator.parse('slug'),
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
      archive: false,
    })

    const demarcheId = newDemarcheId('demarche-id')
    await TitresDemarches.query().insert({
      id: demarcheId,
      titreId,
      typeId: 'oct',
    })

    const etapeId = newEtapeId('titre-etape-id')
    await TitresEtapes.query().insert({
      id: etapeId,
      titreDemarcheId: demarcheId,
      typeId: 'mfr',
      statutId: 'fai',
      date: toCaminoDate('2022-01-01'),
      ordre: 0,
      administrationsLocales: ['aut-97300-01', 'aut-mrae-guyane-01'],
    })

    await titreUpdate(titreId, { propsTitreEtapesIds: { points: etapeId } })

    const tested = await restCall(dbPool, '/rest/titres/:titreId', { titreId }, userSuper)

    expect(tested.statusCode).toBe(200)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "demarches": [
          {
            "demarche_date_debut": null,
            "demarche_date_fin": null,
            "demarche_statut_id": "ind",
            "demarche_type_id": "oct",
            "description": null,
            "etapes": [
              {
                "avis_documents": [],
                "date": "2022-01-01",
                "entreprises_documents": [],
                "etape_documents": [],
                "etape_statut_id": "fai",
                "etape_type_id": "mfr",
                "fondamentale": {
                  "amodiataireIds": null,
                  "date_debut": null,
                  "date_fin": null,
                  "duree": null,
                  "perimetre": null,
                  "substances": [],
                  "titulaireIds": null,
                },
                "id": "titre-etape-id",
                "is_brouillon": false,
                "note": {
                  "is_avertissement": false,
                  "valeur": "",
                },
                "ordre": 0,
                "sections_with_values": [
                  {
                    "elements": [
                      {
                        "description": "",
                        "id": "mecanise",
                        "nom": "Prospection mécanisée",
                        "optionnel": false,
                        "type": "radio",
                        "value": null,
                      },
                      {
                        "description": "Nombre de franchissements de cours d'eau",
                        "id": "franchissements",
                        "nom": "Franchissements de cours d'eau",
                        "optionnel": true,
                        "type": "integer",
                        "value": null,
                      },
                    ],
                    "id": "arm",
                    "nom": "Caractéristiques ARM",
                  },
                ],
                "slug": "demarche-id-mfr99",
              },
            ],
            "id": "demarche-id",
            "ordre": 0,
            "slug": "titre-id-oct99",
          },
        ],
        "id": "titre-id",
        "nb_activites_to_do": null,
        "nom": "mon titre",
        "references": [],
        "slug": "slug",
        "titre_doublon": null,
        "titre_last_modified_date": null,
        "titre_statut_id": "val",
        "titre_type_id": "arm",
      }
    `)
  })
})

test('utilisateurTitreAbonner', async () => {
  const titre = await titreCreate(
    {
      nom: 'mon autre titre',
      typeId: 'arm',
      slug: titreSlugValidator.parse('slug'),
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
    },
    {}
  )

  const tested = await restPostCall(dbPool, '/rest/titres/:titreId/abonne', { titreId: titre.id }, userSuper, { abonne: true })

  expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
})
