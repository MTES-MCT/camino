/* eslint-disable sql/no-unsafe-query */
import { dbManager } from '../../../tests/db-manager'
import { Knex } from 'knex'
import Titres from '../../database/models/titres'
import TitresDemarches from '../../database/models/titres-demarches'
import TitresEtapes from '../../database/models/titres-etapes'
import { titresEtapesAreasUpdate } from './titres-etapes-areas-update'
import { BaisieuxPerimetre, foret2BranchesPerimetre, foretReginaPerimetre, SaintEliePerimetre, SinnamaryPerimetre } from './__mocks__/titres-etapes-areas-update'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create'
import { SDOMZoneIds } from 'camino-common/src/static/sdom'
import { toCaminoDate } from 'camino-common/src/date'
import { vi, beforeAll, afterAll, describe, test, expect } from 'vitest'
import { toCommuneId } from 'camino-common/src/static/communes'
import { ForetId } from 'camino-common/src/static/forets'
import { insertCommune } from '../../database/queries/communes.queries'
import { Pool } from 'pg'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { ETAPE_IS_BROUILLON } from 'camino-common/src/etape'

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
    await insertCommune(dbPool, { id: saintElieId, nom: 'Saint-Élie', geometry: SaintEliePerimetre })
    await insertCommune(dbPool, { id: baisieuxId, nom: 'Baisieux', geometry: BaisieuxPerimetre })
    await insertCommune(dbPool, { id: toCommuneId('97312'), nom: 'Sinnamary', geometry: SinnamaryPerimetre })

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
      slug: titreSlugValidator.parse(`slug-${titreId}`),
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
    const multiPolygonWith4Points: FeatureMultiPolygon = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-53.16822754488772, 5.02935254143807],
              [-53.15913163720232, 5.029382753429523],
              [-53.15910186841349, 5.020342601941031],
              [-53.168197650929095, 5.02031244452273],
              [-53.16822754488772, 5.02935254143807],
            ],
          ],
        ],
      },
    }

    await TitresEtapes.query().insert([
      {
        id: titreEtapeId,
        date: toCaminoDate('2022-03-09'),
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_BROUILLON,
        titreDemarcheId,
        archive: false,
        sdomZones: [SDOMZoneIds.Zone2],
        forets: [reginaId],
        communes: [
          { id: baisieuxId, surface: 12 },
          { id: saintElieId, surface: 12 },
        ],
        geojson4326Perimetre: multiPolygonWith4Points,
        geojsonOriginePerimetre: multiPolygonWith4Points,
        geojsonOrigineGeoSystemeId: '4326',
      },
    ])

    await titresEtapesAreasUpdate(dbPool, [titreEtapeId])

    expect(await TitresEtapes.query().where('id', titreEtapeId)).toMatchSnapshot()
    await Titres.query()
      .patch({ propsTitreEtapesIds: { points: titreEtapeId } })
      .where({ id: titreId })
    expect(await Titres.query().where('id', titreId).withGraphFetched('[pointsEtape]')).toMatchSnapshot()
  })
})
