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
let knex
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

    const etapesCrees = await titreEtapesCreate(titreDemarche, [
      { typeId: 'mfr', statutId: 'fai', date: '2018-01-01' },
      { typeId: 'mcp', statutId: 'fai', date: '2018-02-01' },
      { typeId: 'mcr', statutId: 'fai', date: '2018-02-10' },
      { typeId: 'sca', statutId: 'fai', date: '2018-03-10' }
    ])

    await knex('titresTitulaires').insert({
      titreEtapeId: etapesCrees[0].id,
      entrepriseId: entreprises[0].id
    })

    await knex('titres')
      .update({ propsTitreEtapesIds: { titulaires: etapesCrees[0].id } })
      .where('id', titre.id)

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
      slug: expect.any(String)
    })
  })
})
