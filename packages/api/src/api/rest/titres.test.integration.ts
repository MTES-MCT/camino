import { dbManager } from '../../../tests/db-manager'
import { titreCreate } from '../../database/queries/titres'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches'
import { titreEtapeCreate } from '../../database/queries/titres-etapes'
import { userSuper } from '../../database/user-super'
import { restCall } from '../../../tests/_utils'
import {
  ADMINISTRATION_IDS,
  Administrations
} from 'camino-common/src/administrations'
import { ITitreDemarche, ITitreEtape } from '../../types'
import { entreprisesUpsert } from '../../database/queries/entreprises'
import { Knex } from 'knex'

let knex: Knex<any, unknown[]>
beforeAll(async () => {
  knex = await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const titreEtapesCreate = async (
  demarche: ITitreDemarche,
  etapes: Omit<ITitreEtape, 'id' | 'titreDemarcheId'>[]
) => {
  const etapesCrees = []
  for (const etape of etapes) {
    etapesCrees.push(
      await titreEtapeCreate(
        {
          ...etape,
          titreDemarcheId: demarche.id
        },
        userSuper,
        demarche.titreId
      )
    )
  }

  return etapesCrees
}

async function createTitreWithEtapes(
  etapes: Omit<ITitreEtape, 'id' | 'titreDemarcheId'>[],
  entreprises: any
) {
  const titre = await titreCreate(
    {
      nom: 'mon titre',
      domaineId: 'm',
      typeId: 'arm',
      statutId: 'val',
      propsTitreEtapesIds: {},
      administrationsGestionnaires: [
        {
          ...Administrations[ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']]
        }
      ],
      references: [
        {
          titreId: 'onfTitreId',
          typeId: 'onf',
          nom: 'ONF',
          type: { nom: 'onf', id: 'onf' }
        }
      ]
    },
    {}
  )

  const titreDemarche = await titreDemarcheCreate({
    titreId: titre.id,
    typeId: 'oct'
  })
  const etapesCrees = await titreEtapesCreate(titreDemarche, etapes)

  await knex('titresTitulaires').insert({
    titreEtapeId: etapesCrees[0].id,
    entrepriseId: entreprises[0].id
  })

  await knex('titres')
    .update({ propsTitreEtapesIds: { titulaires: etapesCrees[0].id } })
    .where('id', titre.id)
}

describe('titresONF', () => {
  test("teste la récupération des données pour l'ONF", async () => {
    const entreprises = await entreprisesUpsert([
      { id: 'plop', nom: 'Mon Entreprise' }
    ])
    await titreCreate(
      {
        nom: 'mon titre simple',
        domaineId: 'm',
        typeId: 'arm',
        statutId: 'val',
        propsTitreEtapesIds: {}
      },
      {}
    )
    await createTitreWithEtapes(
      [
        { typeId: 'mfr', statutId: 'fai', date: '2022-01-01', ordre: 0 },
        { typeId: 'mdp', statutId: 'fai', date: '2022-02-01', ordre: 1 },
        { typeId: 'pfd', statutId: 'fai', date: '2022-02-10', ordre: 2 },
        { typeId: 'mcp', statutId: 'com', date: '2022-03-10', ordre: 3 }
      ],
      entreprises
    )
    await createTitreWithEtapes(
      [
        { typeId: 'mfr', statutId: 'fai', date: '2022-01-01', ordre: 0 },
        { typeId: 'mdp', statutId: 'fai', date: '2022-02-01', ordre: 1 },
        { typeId: 'pfd', statutId: 'fai', date: '2022-02-10', ordre: 2 }
      ],
      entreprises
    )

    const tested = await restCall(
      '/titresONF',
      'admin',
      ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    )

    expect(tested.statusCode).toBe(200)
    expect(tested.body).toHaveLength(2)
    expect(tested.body[0]).toMatchSnapshot({
      id: expect.any(String),
      slug: expect.any(String),
      references: [{ titreId: expect.any(String) }]
    })
    expect(tested.body[1]).toMatchSnapshot({
      id: expect.any(String),
      slug: expect.any(String),
      references: [{ titreId: expect.any(String) }]
    })
  })
})
