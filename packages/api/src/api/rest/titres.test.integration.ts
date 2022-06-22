import { dbManager } from '../../../tests/db-manager.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreEtapeCreate } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { restCall, restPostCall } from '../../../tests/_utils/index.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { ITitreDemarche, ITitreEtape } from '../../types.js'
import { entreprisesUpsert } from '../../database/queries/entreprises.js'
import { Knex } from 'knex'
import { toCaminoDate } from 'camino-common/src/date.js'
import { afterAll, beforeAll, describe, test, expect } from 'vitest'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'

let knex: Knex<any, unknown[]>
beforeAll(async () => {
  knex = await dbManager.populateDb()

  const entreprises = await entreprisesUpsert([
    { id: newEntrepriseId('plop'), nom: 'Mon Entreprise' }
  ])
  await titreCreate(
    {
      nom: 'mon titre simple',
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {}
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
        ordre: 0
      },
      {
        typeId: 'mdp',
        statutId: 'fai',
        date: toCaminoDate('2022-02-01'),
        ordre: 1
      },
      {
        typeId: 'pfd',
        statutId: 'fai',
        date: toCaminoDate('2022-02-10'),
        ordre: 2
      },
      {
        typeId: 'mcp',
        statutId: 'com',
        date: toCaminoDate('2022-03-10'),
        ordre: 3
      }
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
        ordre: 0
      },
      {
        typeId: 'mdp',
        statutId: 'fai',
        date: toCaminoDate('2022-02-01'),
        ordre: 1
      },
      {
        typeId: 'pfd',
        statutId: 'fai',
        date: toCaminoDate('2022-02-10'),
        ordre: 2
      }
    ],
    entreprises
  )
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
  nomTitre: string,
  etapes: Omit<ITitreEtape, 'id' | 'titreDemarcheId'>[],
  entreprises: any
) {
  const titre = await titreCreate(
    {
      nom: nomTitre,
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
      references: [
        {
          referenceTypeId: 'onf',
          nom: 'ONF'
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
    const tested = await restCall('/titresONF', {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    })

    expect(tested.statusCode).toBe(200)
    expect(tested.body).toHaveLength(2)
    expect(tested.body[0]).toMatchSnapshot({
      id: expect.any(String),
      slug: expect.any(String)
    })
    expect(tested.body[1]).toMatchSnapshot({
      id: expect.any(String),
      slug: expect.any(String)
    })
  })
})

describe('titresPTMG', () => {
  test('teste la récupération des données pour le PTMG', async () => {
    const tested = await restCall('/titresPTMG', {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']
    })

    expect(tested.statusCode).toBe(200)
    expect(tested.body).toHaveLength(2)
    expect(tested.body[0]).toMatchSnapshot({
      id: expect.any(String),
      slug: expect.any(String)
    })
    expect(tested.body[1]).toMatchSnapshot({
      id: expect.any(String),
      slug: expect.any(String)
    })
  })
})
describe('titresLiaisons', () => {
  test('peut lier deux titres', async () => {
    const getTitres = await restCall('/titresONF', {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    })
    const titreId = getTitres.body[0].id

    const axm = await titreCreate(
      {
        nom: 'mon axm simple',
        typeId: 'axm',
        titreStatutId: 'val',
        propsTitreEtapesIds: {}
      },
      {}
    )

    const tested = await restPostCall(
      `/titres/${axm.id}/titreLiaisons`,
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
      },
      [titreId]
    )

    expect(tested.statusCode).toBe(200)
    expect(tested.body.amont).toHaveLength(1)
    expect(tested.body.aval).toHaveLength(0)
    expect(tested.body.amont[0]).toStrictEqual({
      id: titreId,
      nom: getTitres.body[0].nom
    })

    const avalTested = await restCall(`/titres/${titreId}/titreLiaisons`, {
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
    })

    expect(avalTested.statusCode).toBe(200)
    expect(avalTested.body.amont).toHaveLength(0)
    expect(avalTested.body.aval).toHaveLength(1)
    expect(avalTested.body.aval[0]).toStrictEqual({
      id: axm.id,
      nom: axm.nom
    })
  })
})
