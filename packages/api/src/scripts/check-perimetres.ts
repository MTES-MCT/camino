import '../init'
import pg from 'pg'
import { config } from '../config/index'
import { Effect } from 'effect'
import { knex } from '../knex'
import { EtapeBrouillon, EtapeId } from 'camino-common/src/etape'
import { CaminoError } from 'camino-common/src/zod-tools'
import { getPerimetreInfosInternal } from '../api/rest/etapes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { FeatureCollectionForages, FeatureCollectionPoints, FeatureMultiPolygon, MultiPolygon } from 'camino-common/src/perimetre'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { titreEtapeUpsert } from '../database/queries/titres-etapes'
import { userSuper } from '../database/user-super'
import { DemarcheId } from 'camino-common/src/demarche'
import { CaminoDate } from 'camino-common/src/date'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { TitreId } from 'camino-common/src/validators/titres'
import { callAndExit } from '../tools/fp-tools'

// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: config().PGHOST,
  user: config().PGUSER,
  password: config().PGPASSWORD,
  database: config().PGDATABASE,
})

type QueryError = "Échec de récupération des ids d'étapes en BDD"
type EtapeError = 'Des étapes ont des périmètres invalides'
type PerimetreValidationError = "Échec de validation d'un périmètre"
type EtapeUploadError = "Échec du réupload d'un périmètre"
type PipelineError = CaminoError<QueryError | EtapeError | PerimetreValidationError | EtapeUploadError>

type Perimetre = {
  titreId: TitreId
  titreTypeId: TitreTypeId
  etapeId: EtapeId
  demarcheId: DemarcheId
  isBrouillon: EtapeBrouillon
  date: CaminoDate
  etapeTypeId: EtapeTypeId
  etapeStatutId: EtapeStatutId
  geojson4326Perimetre: MultiPolygon
  geojsonOriginePerimetre: FeatureMultiPolygon | null
  geojsonOriginePoints: FeatureCollectionPoints | null
  geojsonOrigineGeoSystemeId: GeoSystemeId | null
  geojsonOrigineForages: FeatureCollectionForages | null
}
function getAllPerimetres(): Effect.Effect<Perimetre[], CaminoError<QueryError>, never> {
  return Effect.gen(function* () {
    const { rows } = yield* Effect.tryPromise({
      try: () =>
        knex.raw<{ rows: Perimetre[] }>(`
        SELECT
          "titreId",
          "titreTypeId",
          "etapeId",
          "demarcheId",
          "isBrouillon",
          "date",
          "etapeTypeId",
          "etapeStatutId",
          ST_AsGeoJSON("geojson4326_perimetre", 40)::json AS "geojson4326Perimetre",
          "geojsonOriginePerimetre",
          "geojsonOriginePoints",
          "geojsonOrigineGeoSystemeId",
          "geojsonOrigineForages"
        FROM (
          SELECT DISTINCT
            t.id AS "titreId",
            t.type_id AS "titreTypeId",
            te.id AS "etapeId",
            td.id AS "demarcheId",
            te.is_brouillon AS "isBrouillon",
            te.date,
            te.type_id AS "etapeTypeId",
            te.statut_id AS "etapeStatutId",
            te.geojson4326_perimetre,
            te.geojson_origine_perimetre AS "geojsonOriginePerimetre",
            te.geojson_origine_points AS "geojsonOriginePoints",
            te.geojson_origine_geo_systeme_id AS "geojsonOrigineGeoSystemeId",
            te.geojson_origine_forages AS "geojsonOrigineForages"
          FROM titres_etapes te
          JOIN titres_demarches td ON td.id = te.titre_demarche_id
          JOIN titres t ON t.id = td.titre_id
          WHERE geojson4326_perimetre IS NOT NULL AND te.archive IS FALSE
          ORDER BY te.date DESC
        ) t
      `),
      catch: error => ({
        message: "Échec de récupération des ids d'étapes en BDD" as const,
        extra: { error },
      }),
    })

    return rows
  })
}

function updatePerimetre(perimetre: Perimetre): Effect.Effect<void, CaminoError<EtapeUploadError>, never> {
  return Effect.tryPromise({
    try: async () => {
      if (perimetre.geojsonOrigineGeoSystemeId !== '4326') {
        throw new Error('Geosysteme invalide')
      }

      await titreEtapeUpsert(
        {
          id: perimetre.etapeId,
          typeId: perimetre.etapeTypeId,
          statutId: perimetre.etapeStatutId,
          date: perimetre.date,
          isBrouillon: perimetre.isBrouillon,
          titreDemarcheId: perimetre.demarcheId,
          geojson4326Perimetre: {
            type: 'Feature',
            geometry: perimetre.geojson4326Perimetre,
            properties: {},
          },
          geojsonOriginePerimetre: {
            type: 'Feature',
            geometry: perimetre.geojson4326Perimetre,
            properties: {},
          },
          geojsonOriginePoints: perimetre.geojsonOriginePoints,
          geojsonOrigineGeoSystemeId: perimetre.geojsonOrigineGeoSystemeId,
          geojsonOrigineForages: perimetre.geojsonOrigineForages,
        },
        userSuper,
        perimetre.titreId
      )
    },
    catch: error => ({
      message: "Échec du réupload d'un périmètre" as const,
      extra: {
        etapeId: perimetre.etapeId,
        error,
      },
    }),
  })
}

type InvalidEtape = { id: EtapeId; errors: string[] }
function getInvalidEtapes(rows: Perimetre[]): Effect.Effect<InvalidEtape[], CaminoError<PerimetreValidationError | EtapeUploadError>, never> {
  return Effect.gen(function* () {
    const invalidEtapes: InvalidEtape[] = []

    for (let i = 0; i < rows.length; i += 1) {
      const errors = yield* getPerimetreErrors(rows[i])
      if (errors.length > 0) {
        invalidEtapes.push({ id: rows[i].etapeId, errors })
        console.error(`(${Math.round((i / rows.length) * 10000) / 100}%) ${rows[i].etapeId} : ${errors.join(', ')}\n`)

        yield* updatePerimetre(rows[i])
      }
    }

    return invalidEtapes
  })
}

function getPerimetreErrors(perimetre: Perimetre): Effect.Effect<string[], CaminoError<PerimetreValidationError>, never> {
  return Effect.tryPromise({
    try: async () => {
      try {
        await callAndExit(
          getPerimetreInfosInternal(
            pool,
            { type: 'Feature', geometry: perimetre.geojson4326Perimetre, properties: {} },
            perimetre.geojsonOriginePerimetre,
            perimetre.geojsonOriginePoints,
            perimetre.titreTypeId,
            perimetre.geojsonOrigineGeoSystemeId,
            perimetre.geojsonOrigineForages
          )
        )
      } catch (error) {
        if (error instanceof Error) {
          return [error.message]
        } else if (typeof error === 'string') {
          return [error]
        } else {
          return ['Périmètre invalide (raison inconnue)']
        }
      }

      return []
    },
    catch: error => ({
      message: "Échec de validation d'un périmètre" as const,
      extra: {
        etapeId: perimetre.etapeId,
        error: error instanceof Error ? error.message : error,
      },
    }),
  })
}

const pipeline: Effect.Effect<void, PipelineError, never> = Effect.gen(function* () {
  console.time('PIPELINE')
  const perimetres = yield* getAllPerimetres()
  const invalidEtapes = yield* getInvalidEtapes(perimetres)
  console.timeEnd('PIPELINE')

  if (invalidEtapes.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`${invalidEtapes.length} ont des périmètres invalides : ${invalidEtapes.map(({ id }) => id).join(',')}`)
    yield* Effect.fail({
      message: `Des étapes ont des périmètres invalides` as const,
      extra: invalidEtapes.map(({ id, errors }) => `${id} : ${errors.join(', ')}`).join('\n'),
    })
  }
})

try {
  await Effect.runPromise(pipeline)
  console.info('Script terminé : aucune erreur détectée')
  process.exit()
} catch (error) {
  process.exit(1)
}
