import { dbManager } from '../../../tests/db-manager'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create'
import { dateAddDays } from 'camino-common/src/date'
import { vi, beforeAll, afterAll, describe, test, expect } from 'vitest'
import { Pool } from 'pg'
import { Knex } from 'knex'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { etapeMiseEnConcurrenceUpdate } from './titres-etapes-mise-en-concurrence'
import { insertTitreGraph } from '../../../tests/integration-test-helper'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TITRES_TYPES_IDS, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DATE_DEBUT_PROCEDURE_SPECIFIQUE } from 'camino-common/src/machines'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes'
import { callAndExit } from '../../tools/fp-tools'
import { ITitre, ITitreEtape } from '../../types'
import { linkTitres } from '../../database/queries/titres-titres.queries'
import TitresEtapes from '../../database/models/titres-etapes'

console.info = vi.fn()
console.error = vi.fn()
let knex: Knex
let dbPool: Pool
beforeAll(async () => {
  const { pool, knex: knexInstance } = await dbManager.populateDb()
  knex = knexInstance
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})
const coordinatesOk = (index: number): FeatureMultiPolygon => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [index, index + 1],
          [index, index + 2],
          [index + 1, index + 2],
          [index + 1, index + 1],
          [index, index + 1],
        ],
      ],
    ],
  },
})

const titre: Omit<ITitre, 'id' | 'typeId'> = {
  nom: 'titre',
  propsTitreEtapesIds: {},
  titreStatutId: TitresStatutIds.DemandeInitiale,
}

const etape: Omit<ITitreEtape, 'id' | 'titreDemarcheId'> = {
  date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 14),
  isBrouillon: ETAPE_IS_NOT_BROUILLON,
  typeId: ETAPES_TYPES.demande,
  statutId: ETAPES_STATUTS.FAIT,
  geojson4326Perimetre: coordinatesOk(1),
  geojsonOriginePerimetre: coordinatesOk(1),
  geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
  substances: ['auru'],
}

const createTitreWithDemarcheAndEtape = async (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, index: number) => {
  const titreId = newTitreId()
  const demarcheId = newDemarcheId()
  const etapeId = newEtapeId()
  await insertTitreGraph({
    ...titre,
    id: titreId,
    typeId: titreTypeId,
    demarches: [
      {
        id: demarcheId,
        titreId,
        typeId: demarcheTypeId,
        etapes: [
          {
            ...etape,
            id: etapeId,
            titreDemarcheId: demarcheId,
            date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 12),
            geojson4326Perimetre: coordinatesOk(index),
            geojsonOriginePerimetre: coordinatesOk(index),
            substances: ['auru', 'acti'],
          },
        ],
      },
    ],
  })
  return { demarcheId, etapeId, titreId }
}
describe('etapeMiseEnConcurrenceUpdate', () => {
  const cases: [TitreTypeId, DemarcheTypeId, TitreTypeId | null][] = [
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX, DEMARCHES_TYPES_IDS.ExtensionDePerimetre, null],
    [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX, DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX],
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.ExtensionDePerimetre, null],
    [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.Octroi, null],
    [TITRES_TYPES_IDS.CONCESSION_METAUX, DEMARCHES_TYPES_IDS.ExtensionDePerimetre, null],
    [TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN, DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN],
  ] as const
  // La bidouille avec les index nous permet d'avoir les périmètres qui ne se touchent pas, tout en augmentant le nombre de titres en base
  test.each<[TitreTypeId, DemarcheTypeId, TitreTypeId | null, number]>(cases.map((value, index) => [...value, index * 10]))(
    'trouve une mise en concurrence pour les titres de type %s des démarches de type %s',
    async (titreTypeId, demarcheTypeId, titreTypeToLink, index) => {
      const { demarcheId: demarcheId1 } = await createTitreWithDemarcheAndEtape(titreTypeId, demarcheTypeId, index)
      const { etapeId: etapeId2, titreId: titreId2 } = await createTitreWithDemarcheAndEtape(titreTypeId, demarcheTypeId, index)

      let result = await callAndExit(etapeMiseEnConcurrenceUpdate(dbPool, etapeId2))
      expect(result).toStrictEqual({
        etapeId: etapeId2,
        new: demarcheId1,
        old: null,
      })

      if (titreTypeToLink !== null) {
        const { titreId } = await createTitreWithDemarcheAndEtape(titreTypeToLink, DEMARCHES_TYPES_IDS.Octroi, index)

        await callAndExit(linkTitres(dbPool, { linkFrom: [titreId], linkTo: titreId2 }))

        result = await callAndExit(etapeMiseEnConcurrenceUpdate(dbPool, etapeId2))

        expect(result).toStrictEqual({
          etapeId: etapeId2,
          old: demarcheId1,
          new: null,
        })
      }
    }
  )

  test('une démarche ne peut pas être en concurrence avec une démarche dont la mise en concurrence est terminée', async () => {
    const coordinatesIndex = 200
    const titreId = newTitreId()
    const demarcheId = newDemarcheId()
    const etapeId = newEtapeId()
    const etapeIdMiseEnConcurrence = newEtapeId()
    const debutMiseEnConcurrence = dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 14)
    const dureeMiseEnConcurrence = 10
    await insertTitreGraph({
      ...titre,
      id: titreId,
      typeId: TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      demarches: [
        {
          id: demarcheId,
          titreId,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          etapes: [
            {
              ...etape,
              id: etapeId,
              titreDemarcheId: demarcheId,
              date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 12),
              geojson4326Perimetre: coordinatesOk(coordinatesIndex),
              geojsonOriginePerimetre: coordinatesOk(coordinatesIndex),
              substances: ['auru', 'acti'],
            },
            {
              ...etape,
              typeId: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
              id: etapeIdMiseEnConcurrence,
              titreDemarcheId: demarcheId,
              date: debutMiseEnConcurrence,
              contenu: { opdp: { duree: dureeMiseEnConcurrence } },
            },
          ],
        },
      ],
    })

    const titreId2 = newTitreId()
    const demarcheId2 = newDemarcheId()
    const etapeId2 = newEtapeId()
    await insertTitreGraph({
      ...titre,
      id: titreId2,
      typeId: TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      demarches: [
        {
          id: demarcheId2,
          titreId: titreId2,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          etapes: [
            {
              ...etape,
              id: etapeId2,
              titreDemarcheId: demarcheId2,
              date: dateAddDays(debutMiseEnConcurrence, dureeMiseEnConcurrence - 2),
              geojson4326Perimetre: coordinatesOk(coordinatesIndex),
              geojsonOriginePerimetre: coordinatesOk(coordinatesIndex),
              substances: ['auru', 'acti'],
            },
          ],
        },
      ],
    })

    const result = await callAndExit(etapeMiseEnConcurrenceUpdate(dbPool, etapeId2))
    expect(result).toStrictEqual({
      etapeId: etapeId2,
      new: demarcheId,
      old: null,
    })

    await knex.raw('update titres_etapes set date = ? where id = ?', [dateAddDays(debutMiseEnConcurrence, dureeMiseEnConcurrence + 2), etapeId2])
    const result2 = await callAndExit(etapeMiseEnConcurrenceUpdate(dbPool, etapeId2))
    expect(result2).toStrictEqual({
      etapeId: etapeId2,
      old: demarcheId,
      new: null,
    })
  })

  test('une démarche ne peut pas être en concurrence avec une démarche qui a été desistée avant la mise en concurrence', async () => {
    const coordinatesIndex = 300
    const titreId = newTitreId()
    const demarcheId = newDemarcheId()
    const etapeId = newEtapeId()
    await insertTitreGraph({
      ...titre,
      id: titreId,
      typeId: TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      demarches: [
        {
          id: demarcheId,
          titreId,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          etapes: [
            {
              ...etape,
              id: etapeId,
              titreDemarcheId: demarcheId,
              date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 12),
              geojson4326Perimetre: coordinatesOk(coordinatesIndex),
              geojsonOriginePerimetre: coordinatesOk(coordinatesIndex),
              substances: ['auru', 'acti'],
            },
          ],
        },
      ],
    })

    const titreId2 = newTitreId()
    const demarcheId2 = newDemarcheId()
    const etapeId2 = newEtapeId()
    await insertTitreGraph({
      ...titre,
      id: titreId2,
      typeId: TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      demarches: [
        {
          id: demarcheId2,
          titreId: titreId2,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          etapes: [
            {
              ...etape,
              id: etapeId2,
              titreDemarcheId: demarcheId2,
              date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 14),
              geojson4326Perimetre: coordinatesOk(coordinatesIndex),
              geojsonOriginePerimetre: coordinatesOk(coordinatesIndex),
              substances: ['auru', 'acti'],
            },
          ],
        },
      ],
    })

    const result = await callAndExit(etapeMiseEnConcurrenceUpdate(dbPool, etapeId2))
    expect(result).toStrictEqual({
      etapeId: etapeId2,
      new: demarcheId,
      old: null,
    })
    const etapeIdDesistement = newEtapeId()
    await TitresEtapes.query().insert({
      ...etape,
      id: etapeIdDesistement,
      typeId: ETAPES_TYPES.desistementDuDemandeur,
      titreDemarcheId: demarcheId,
      date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 14),
    })
    const result2 = await callAndExit(etapeMiseEnConcurrenceUpdate(dbPool, etapeId2))
    expect(result2).toStrictEqual({
      etapeId: etapeId2,
      old: demarcheId,
      new: null,
    })
  })
})
