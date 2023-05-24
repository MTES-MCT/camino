import { dbManager } from '../../../tests/db-manager.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreEtapeCreate } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { restCall } from '../../../tests/_utils/index.js'
import { ITitreDemarche, ITitreEtape } from '../../types.js'
import { entreprisesUpsert } from '../../database/queries/entreprises.js'
import { Knex } from 'knex'
import { toCaminoDate } from 'camino-common/src/date.js'
import { afterAll, beforeAll, test, expect, vi } from 'vitest'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import type { Pool } from 'pg'
import { constants } from 'http2'

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
    .update({ contenusTitreEtapesIds: { arm: { mecanise: etapesCrees[0].id, franchissements: etapesCrees[0].id } } })
    .where('id', titre.id)

  return titre.id
}

test('get titreSections', async () => {
  const entreprises = await entreprisesUpsert([{ id: newEntrepriseId('plop'), nom: 'Mon Entreprise' }])
  const id = await createTitreWithEtapes(
    'titre1',
    [
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: toCaminoDate('2022-01-01'),
        ordre: 0,
        contenu: { arm: { mecanise: true, franchissements: 8 } },
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

  const tested = await restCall(dbPool, '/rest/titreSections/:titreId', { titreId: id }, userSuper)

  expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)
  expect(tested.body).toMatchInlineSnapshot(`
      [
        {
          "elements": [
            {
              "description": "",
              "id": "mecanise",
              "nom": "Prospection mécanisée",
              "type": "radio",
              "value": true,
            },
            {
              "description": "Nombre de franchissements de cours d'eau",
              "id": "franchissements",
              "nom": "Franchissements de cours d'eau",
              "optionnel": true,
              "type": "integer",
              "value": 8,
            },
          ],
          "id": "arm",
          "nom": "Caractéristiques ARM",
        },
      ]
    `)
})
