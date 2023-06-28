/* eslint-disable sql/no-unsafe-query */
import { dbManager } from '../../../tests/db-manager.js'
import { Knex } from 'knex'
import Titres from '../../database/models/titres.js'
import TitresDemarches from '../../database/models/titres-demarches.js'
import TitresEtapes from '../../database/models/titres-etapes.js'
import TitresPoints from '../../database/models/titres-points.js'
import { titresEtapesAreasUpdate } from './titres-etapes-areas-update.js'
import { BaisieuxPerimetre, foret2BranchesPerimetre, foretReginaPerimetre, SaintEliePerimetre, SinnamaryPerimetre } from './__mocks__/titres-etapes-areas-update.js'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create.js'
import { SDOMZoneIds } from 'camino-common/src/static/sdom.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { vi, beforeAll, afterAll, describe, test, expect } from 'vitest'
import { toCommuneId } from 'camino-common/src/static/communes.js'
import { ForetId } from 'camino-common/src/static/forets.js'
import { insertCommune } from '../../database/queries/communes.queries.js'
import { Pool } from 'pg'

console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool
let knex: Knex | undefined
beforeAll(async () => {
  const { knex: knexInstance, pool } = await dbManager.populateDb()
  knex = knexInstance
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('titresEtapesAreasUpdate', () => {
  test('met à jour les communes, forêts et zone du SDOM sur une étape', async () => {
    const baisieuxId = toCommuneId('59044')
    const saintElieId = toCommuneId('97358')
    await insertCommune(dbPool, { id: saintElieId, nom: 'Saint-Élie' })
    await insertCommune(dbPool, { id: baisieuxId, nom: 'Baisieux' })
    await insertCommune(dbPool, { id: toCommuneId('97312'), nom: 'Sinnamary' })

    await knex!.raw(`insert into communes_postgis (id, geometry) values ('${saintElieId}','${SaintEliePerimetre}')`)
    await knex!.raw(`insert into communes_postgis (id, geometry) values ('${baisieuxId}', '${BaisieuxPerimetre}')`)
    await knex!.raw(`insert into communes_postgis (id, geometry) values ('97312', '${SinnamaryPerimetre}')`)

    const reginaId: ForetId = 'FRG'
    const deuxBranchesId: ForetId = 'DBR'
    await knex!.raw(`insert into forets_postgis (id, geometry) values ('${deuxBranchesId}','${foret2BranchesPerimetre}')`)
    await knex!.raw(`insert into forets_postgis (id, geometry) values ('${reginaId}','${foretReginaPerimetre}')`)

    // Pour simplifier le test, on utilise des forêts en tant que zone de sdom
    await knex!.raw(`insert into sdom_zones_postgis (id, geometry) values ('${SDOMZoneIds.Zone1}','${foret2BranchesPerimetre}')`)
    await knex!.raw(`insert into sdom_zones_postgis (id, geometry) values ('${SDOMZoneIds.Zone2}','${foretReginaPerimetre}')`)
    const titreId = newTitreId('titreIdUniquePourMiseAJourAreas')
    await Titres.query().insert({
      id: titreId,
      slug: `slug-${titreId}`,
      nom: `nom-${titreId}`,
      titreStatutId: 'val',
      typeId: 'arm',
    })

    const titreDemarcheId = newDemarcheId('titreDemarcheIdUniquePourMiseAJourAreas')
    await TitresDemarches.query().insert([
      {
        id: titreDemarcheId,
        typeId: 'oct',
        statutId: 'eco',
        titreId,
        archive: false,
      },
    ])

    const titreEtapeId = newEtapeId('titreEtapeIdUniquePourMiseAJourAreas')
    await TitresEtapes.query().insert([
      {
        id: titreEtapeId,
        date: toCaminoDate('2022-03-09'),
        typeId: 'mfr',
        statutId: 'aco',
        titreDemarcheId,
        archive: false,
        sdomZones: [SDOMZoneIds.Zone2],
        forets: [reginaId],
        communes: [
          { id: baisieuxId, surface: 12 },
          { id: saintElieId, surface: 12 },
        ],
      },
    ])

    await TitresPoints.query().insert([
      {
        titreEtapeId,
        groupe: 1,
        contour: 1,
        point: 1,
        coordonnees: { x: -53.16822754488772, y: 5.02935254143807 },
      },
      {
        titreEtapeId,
        groupe: 1,
        contour: 1,
        point: 2,
        coordonnees: { x: -53.15913163720232, y: 5.029382753429523 },
      },
      {
        titreEtapeId,
        groupe: 1,
        contour: 1,
        point: 3,
        coordonnees: { x: -53.15910186841349, y: 5.020342601941031 },
      },
      {
        titreEtapeId,
        groupe: 1,
        contour: 1,
        point: 4,
        coordonnees: { x: -53.168197650929095, y: 5.02031244452273 },
      },
    ])

    await titresEtapesAreasUpdate([titreEtapeId])

    expect(await TitresEtapes.query().where('id', titreEtapeId)).toMatchSnapshot()
    await Titres.query()
      .patch({ propsTitreEtapesIds: { points: titreEtapeId } })
      .where({ id: titreId })
    expect(await Titres.query().where('id', titreId).withGraphFetched('[pointsEtape]')).toMatchSnapshot()
  })
})
