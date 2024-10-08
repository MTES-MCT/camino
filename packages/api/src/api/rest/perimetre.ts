import { DemarcheId, demarcheIdOrSlugValidator } from 'camino-common/src/demarche'
import { CaminoRequest, CustomResponse } from './express-type'
import { Pool } from 'pg'
import { pipe, Effect, Match } from 'effect'
import { GeoSystemes } from 'camino-common/src/static/geoSystemes'
import { HTTP_STATUS } from 'camino-common/src/http'
import {
  ConvertPointsErrors,
  GetGeojsonByGeoSystemeIdErrorMessages,
  GetGeojsonInformationErrorMessages,
  GetTitresIntersectionWithGeojson,
  convertPoints,
  getGeojsonByGeoSystemeId as getGeojsonByGeoSystemeIdQuery,
  getGeojsonInformation,
  getTitresIntersectionWithGeojson,
} from './perimetre.queries'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { getMostRecentEtapeFondamentaleValide } from './titre-heritage'
import { isAdministrationAdmin, isAdministrationEditeur, isDefault, isSuper, User } from 'camino-common/src/roles'
import { getDemarcheByIdOrSlug, getEtapesByDemarcheId } from './demarches.queries'
import { getAdministrationsLocalesByTitreId, getTitreByIdOrSlug, getTitulairesAmodiatairesByTitreId } from './titres.queries'
import { etapeIdOrSlugValidator } from 'camino-common/src/etape'
import { getEtapeById } from './etapes.queries'
import {
  FeatureCollectionPoints,
  FeatureMultiPolygon,
  GeojsonInformations,
  MultiPolygon,
  PerimetreInformations,
  featureCollectionPointsValidator,
  featureCollectionMultipolygonValidator,
  multiPolygonValidator,
  polygonValidator,
  featureCollectionPolygonValidator,
  GeojsonImportPointsResponse,
  GeojsonImportForagesResponse,
  featureCollectionForagesValidator,
  FeatureCollectionForages,
  featureForagePropertiesValidator,
} from 'camino-common/src/perimetre'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { parseShp } from 'shpjs'
import { DeepReadonly, isNotNullNorUndefined, isNullOrUndefined, memoize } from 'camino-common/src/typescript-tools'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { canReadEtape } from './permissions/etapes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import xlsx from 'xlsx'
import { ZodTypeAny, z } from 'zod'
import { CommuneId } from 'camino-common/src/static/communes'
import { CaminoApiError } from '../../types'
import { DbQueryAccessError } from '../../pg-database'
import { ZodUnparseable, callAndExit, zodParseEffect, zodParseEffectCallback } from '../../tools/fp-tools'
import { CaminoError } from 'camino-common/src/zod-tools'
import { RestNewPostCall } from '../../server/rest'

export const getPerimetreInfos =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<PerimetreInformations>): Promise<void> => {
    const user = req.auth

    if (!user) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const etapeIdOrSlugParsed = etapeIdOrSlugValidator.safeParse(req.params.etapeId)
      const demarcheIdOrSlugParsed = demarcheIdOrSlugValidator.safeParse(req.params.demarcheId)

      if (!etapeIdOrSlugParsed.success && !demarcheIdOrSlugParsed.success) {
        res.sendStatus(HTTP_STATUS.BAD_REQUEST)
      } else {
        try {
          let etape: null | { demarche_id: DemarcheId; geojson4326_perimetre: MultiPolygon | null; sdom_zones: SDOMZoneId[]; etape_type_id: EtapeTypeId; communes: CommuneId[] } = null
          if (etapeIdOrSlugParsed.success) {
            const myEtape = await getEtapeById(pool, etapeIdOrSlugParsed.data)

            etape = { demarche_id: myEtape.demarche_id, geojson4326_perimetre: myEtape.geojson4326_perimetre, sdom_zones: myEtape.sdom_zones ?? [], etape_type_id: myEtape.etape_type_id, communes: [] }
          } else if (demarcheIdOrSlugParsed.success) {
            const demarche = await getDemarcheByIdOrSlug(pool, demarcheIdOrSlugParsed.data)
            const etapes = await getEtapesByDemarcheId(pool, demarche.demarche_id)

            const mostRecentEtapeFondamentale = getMostRecentEtapeFondamentaleValide([{ ordre: 1, etapes }])
            if (isNotNullNorUndefined(mostRecentEtapeFondamentale)) {
              etape = {
                demarche_id: demarche.demarche_id,
                geojson4326_perimetre: mostRecentEtapeFondamentale.geojson4326_perimetre,
                sdom_zones: mostRecentEtapeFondamentale.sdom_zones ?? [],
                etape_type_id: mostRecentEtapeFondamentale.etape_type_id,
                communes: mostRecentEtapeFondamentale.communes.map(({ id }) => id),
              }
            }
          } else {
            res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            console.error("cas impossible où ni l'étape id ni la démarche Id n'est chargée")
          }

          if (isNullOrUndefined(etape)) {
            res.json({
              superposition_alertes: [],
              sdomZoneIds: [],
              communes: [],
            })
          } else {
            const demarche = await getDemarcheByIdOrSlug(pool, etape.demarche_id)
            const titre = await getTitreByIdOrSlug(pool, demarche.titre_id)

            const administrationsLocales = memoize(() => getAdministrationsLocalesByTitreId(pool, demarche.titre_id))

            if (
              await canReadEtape(
                user,
                memoize(() => Promise.resolve(titre.titre_type_id)),
                administrationsLocales,
                memoize(() => getTitulairesAmodiatairesByTitreId(pool, demarche.titre_id)),
                etape.etape_type_id,
                { ...demarche, titre_public_lecture: titre.public_lecture }
              )
            ) {
              await callAndExit(getAlertesSuperposition(etape.geojson4326_perimetre, titre.titre_type_id, titre.titre_slug, user, pool), async superpositionAlertes => {
                res.json({
                  superposition_alertes: superpositionAlertes,
                  sdomZoneIds: etape.sdom_zones,
                  communes: etape.communes,
                })
              })
            } else {
              res.sendStatus(HTTP_STATUS.FORBIDDEN)
            }
          }
        } catch (e) {
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(e)
          console.error(e)
        }
      }
    }
  }

const shapeValidator = z.array(polygonValidator.or(multiPolygonValidator)).max(1).min(1)
const geojsonValidator = featureCollectionMultipolygonValidator.or(featureCollectionPolygonValidator)

const csvInputNumberValidator = z.union([z.string(), z.number()]).transform<number>(val => {
  if (typeof val === 'string') {
    if (val.includes(',')) {
      return Number.parseFloat(val.replace(/\./g, '').replace(/,/g, '.'))
    }

    return Number.parseFloat(val)
  } else {
    return val
  }
})

const csvCommonValidator = z
  .object({})
  .passthrough()
  .transform(value => {
    if ('Nom du point' in value) {
      value.nom = value['Nom du point']
    }
    Object.keys(value).forEach(k => (value[k.toLowerCase()] = value[k]))

    return value
  })

const csvCommonLowerValidator = z.object({ nom: z.string(), description: z.string().optional() })
const makeCsvToJsonValidator = <T extends ZodTypeAny>(pointValidator: T) => z.array(csvCommonValidator.pipe(pointValidator))
const csvXYValidator = makeCsvToJsonValidator(csvCommonLowerValidator.extend({ x: csvInputNumberValidator, y: csvInputNumberValidator }))
const csvLatLongValidator = makeCsvToJsonValidator(csvCommonLowerValidator.extend({ longitude: csvInputNumberValidator, latitude: csvInputNumberValidator }))
const csvForageXYValidator = makeCsvToJsonValidator(
  featureForagePropertiesValidator.omit({ profondeur: true }).extend({ x: csvInputNumberValidator, y: csvInputNumberValidator, profondeur: csvInputNumberValidator })
)
const csvForageDegValidator = makeCsvToJsonValidator(
  featureForagePropertiesValidator.omit({ profondeur: true }).extend({ longitude: csvInputNumberValidator, latitude: csvInputNumberValidator, profondeur: csvInputNumberValidator })
)

const ouvertureGeoJSONError = "Une erreur s'est produite lors de l'ouverture du fichier GeoJSON" as const
const ouvertureShapeError = "Une erreur s'est produite lors de l'ouverture du fichier shape" as const
const ouvertureCsvError = 'Une erreur est survenue lors de la lecture du csv' as const
const importCsvRestrictionError = "L'import CSV est fait pour des petits polygones simple de moins de 20 sommets" as const
const recuperationInfoCsvError = `Une erreur est survenue lors de la récupération des informations du CSV` as const
const extractionGeoJSONError = "Une erreur s'est produite lors de l'extraction du multi-polygone du fichier GeoJSON" as const
const extractionShapeError = "Une erreur s'est produite lors de l'extraction du multi-polygone du fichier shape" as const
type GeojsonImportErrorMessages =
  | ZodUnparseable
  | DbQueryAccessError
  | typeof ouvertureGeoJSONError
  | typeof ouvertureShapeError
  | typeof ouvertureCsvError
  | typeof importCsvRestrictionError
  | typeof recuperationInfoCsvError
  | typeof extractionGeoJSONError
  | typeof extractionShapeError
  | GetGeojsonByGeoSystemeIdErrorMessages
  | GetGeojsonInformationErrorMessages
  | ConvertPointsErrors
export const geojsonImport: RestNewPostCall<'/rest/geojson/import/:geoSystemeId'> = ({
  pool,
  user,
  body,
  params,
}): Effect.Effect<DeepReadonly<GeojsonInformations>, CaminoApiError<GeojsonImportErrorMessages>> => {
  const pathFrom = join(process.cwd(), `/files/tmp/${body.tempDocumentName}`)

  return pipe(
    Effect.Do.pipe(
      Effect.flatMap<
        Record<string, never>,
        { geojsonOriginFeatureMultiPolygon: FeatureMultiPolygon; geojsonOriginFeatureCollectionPoints: null | FeatureCollectionPoints },
        CaminoError<GeojsonImportErrorMessages>,
        never
      >(() => {
        return Match.value(body.fileType).pipe(
          Match.when('geojson', () =>
            pipe(
              fileNameToJson(pathFrom, geojsonValidator),
              Effect.flatMap(features =>
                Effect.try({
                  try: () => {
                    const firstGeometry = features.features[0].geometry
                    const multiPolygon: MultiPolygon = firstGeometry.type === 'Polygon' ? { type: 'MultiPolygon', coordinates: [firstGeometry.coordinates] } : firstGeometry

                    const geojsonOriginFeatureMultiPolygon: FeatureMultiPolygon = { type: 'Feature', properties: {}, geometry: multiPolygon }

                    let geojsonOriginFeatureCollectionPoints: null | FeatureCollectionPoints = null
                    // On a des points après le multipolygone
                    if (features.features.length > 1) {
                      const [_multi, ...points] = features.features
                      geojsonOriginFeatureCollectionPoints = { type: 'FeatureCollection', features: points }
                    }

                    return { geojsonOriginFeatureMultiPolygon, geojsonOriginFeatureCollectionPoints }
                  },
                  catch: e => ({ message: extractionGeoJSONError, extra: e }),
                })
              )
            )
          ),
          Match.when('shp', () =>
            pipe(
              fileNameToShape(pathFrom, shapeValidator),
              Effect.flatMap(shapePolygonOrMultipolygons =>
                Effect.try({
                  try: () => {
                    const shapePolygonOrMultipolygon = shapePolygonOrMultipolygons[0]
                    let coordinates: [number, number][][][]
                    if (shapePolygonOrMultipolygon.type === 'MultiPolygon') {
                      coordinates = shapePolygonOrMultipolygon.coordinates
                    } else {
                      coordinates = [shapePolygonOrMultipolygon.coordinates]
                    }
                    const geojsonOriginFeatureMultiPolygon: FeatureMultiPolygon = { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates }, properties: {} }

                    return { geojsonOriginFeatureMultiPolygon, geojsonOriginFeatureCollectionPoints: null }
                  },
                  catch: e => ({ message: extractionShapeError, extra: e }),
                })
              )
            )
          ),
          Match.when('csv', () =>
            pipe(
              fileNameToCsv(pathFrom),
              Effect.filterOrFail(
                converted => converted.length <= 20,
                () => ({ message: importCsvRestrictionError })
              ),
              Effect.flatMap(converted => {
                const uniteId = GeoSystemes[params.geoSystemeId].uniteId
                const myPipe = Match.value(uniteId).pipe(
                  Match.when('met', () =>
                    pipe(
                      zodParseEffect(csvXYValidator, converted),
                      Effect.flatMap(rows =>
                        Effect.try({
                          try: () => {
                            const coordinates: MultiPolygon['coordinates'] = [[rows.map(({ x, y }) => [x, y])]]
                            const points: FeatureCollectionPoints['features'] = rows.map(ligne => ({
                              type: 'Feature',
                              properties: { nom: ligne.nom, description: ligne.description },
                              geometry: { type: 'Point', coordinates: [ligne.x, ligne.y] },
                            }))

                            coordinates[0][0].push([rows[0].x, rows[0].y])

                            return { coordinates, points }
                          },
                          catch: e => ({ message: recuperationInfoCsvError, extra: e }),
                        })
                      )
                    )
                  ),
                  Match.whenOr('gon', 'deg', () =>
                    pipe(
                      zodParseEffect(csvLatLongValidator, converted),
                      Effect.flatMap(rows =>
                        Effect.try({
                          try: () => {
                            const coordinates: MultiPolygon['coordinates'] = [[rows.map(({ longitude, latitude }) => [longitude, latitude])]]
                            const points: FeatureCollectionPoints['features'] = rows.map(ligne => ({
                              type: 'Feature',
                              properties: { nom: ligne.nom, description: ligne.description },
                              geometry: { type: 'Point', coordinates: [ligne.longitude, ligne.latitude] },
                            }))
                            coordinates[0][0].push([rows[0].longitude, rows[0].latitude])

                            return { coordinates, points }
                          },
                          catch: e => ({ message: recuperationInfoCsvError, extra: e }),
                        })
                      )
                    )
                  ),
                  Match.exhaustive
                )

                return pipe(
                  myPipe,
                  Effect.map(({ coordinates, points }) => {
                    const geojsonOriginFeatureMultiPolygon: FeatureMultiPolygon = { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates } }
                    const geojsonOriginFeatureCollectionPoints: FeatureCollectionPoints = { type: 'FeatureCollection', features: points }

                    return { geojsonOriginFeatureMultiPolygon, geojsonOriginFeatureCollectionPoints }
                  })
                )
              })
            )
          ),
          Match.exhaustive
        )
      })
    ),
    Effect.bind('geojson4326MultiPolygon', ({ geojsonOriginFeatureMultiPolygon }) =>
      pipe(
        getGeojsonByGeoSystemeIdQuery(pool, params.geoSystemeId, geojsonOriginFeatureMultiPolygon),
        Effect.map(result => result.geometry)
      )
    ),
    Effect.bind('geojson4326FeatureCollectionPoints', ({ geojsonOriginFeatureCollectionPoints }) => {
      if (isNotNullNorUndefined(geojsonOriginFeatureCollectionPoints)) {
        return convertPoints(pool, params.geoSystemeId, geojsonOriginFeatureCollectionPoints)
      }

      return Effect.succeed(null)
    }),
    Effect.bind('geoInfo', ({ geojson4326MultiPolygon }) => getGeojsonInformation(pool, geojson4326MultiPolygon)),
    Effect.bind('alertesSuperposition', ({ geojson4326MultiPolygon }) => getAlertesSuperposition(geojson4326MultiPolygon, body.titreTypeId, body.titreSlug, user, pool)),
    Effect.map(({ geojson4326MultiPolygon, geojson4326FeatureCollectionPoints, geoInfo, alertesSuperposition, geojsonOriginFeatureMultiPolygon, geojsonOriginFeatureCollectionPoints }) => {
      const result: GeojsonInformations = {
        superposition_alertes: alertesSuperposition,
        communes: geoInfo.communes,
        foretIds: geoInfo.forets,
        sdomZoneIds: geoInfo.sdom,
        secteurMaritimeIds: geoInfo.secteurs,
        surface: geoInfo.surface,
        geojson4326_perimetre: { type: 'Feature', geometry: geojson4326MultiPolygon, properties: {} },
        geojson4326_points: geojson4326FeatureCollectionPoints,
        geojson_origine_perimetre: geojsonOriginFeatureMultiPolygon,
        geojson_origine_points: geojsonOriginFeatureCollectionPoints,
        geojson_origine_geo_systeme_id: params.geoSystemeId,
      }

      return result
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr(
          'Une erreur est survenue lors de la lecture du csv',
          'Une erreur est survenue lors de la récupération des informations du CSV',
          'Une erreur inattendue est survenue lors de la récupération des informations geojson en base',
          "Impossible d'accéder à la base de données",
          () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })
        ),
        Match.whenOr(
          'Problème de validation de données',
          "Une erreur s'est produite lors de l'ouverture du fichier GeoJSON",
          "Une erreur s'est produite lors de l'ouverture du fichier shape",
          'Impossible de convertir la géométrie en JSON',
          'Impossible de convertir le geojson vers le système',
          "L'import CSV est fait pour des petits polygones simple de moins de 20 sommets",
          "Le périmètre n'est pas valide dans le référentiel donné",
          "Une erreur s'est produite lors de l'extraction du multi-polygone du fichier GeoJSON",
          "Une erreur s'est produite lors de l'extraction du multi-polygone du fichier shape",
          'Impossible de transformer la feature collection',
          'La liste des points est vide',
          'Le nombre de points est invalide',
          'Problème de Système géographique (SRID)',
          () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })
        ),
        Match.exhaustive
      )
    )
  )
}
const fileNameToJson = <T extends ZodTypeAny>(pathFrom: string, validator: T): Effect.Effect<z.infer<T>, CaminoError<ZodUnparseable | typeof ouvertureGeoJSONError>> => {
  return pipe(
    Effect.try({
      try: () => {
        const fileContent = readFileSync(pathFrom)

        return JSON.parse(fileContent.toString())
      },
      catch: () => ({ message: ouvertureGeoJSONError }),
    }),
    Effect.flatMap(zodParseEffectCallback(validator))
  )
}
const fileNameToShape = <T extends ZodTypeAny>(pathFrom: string, validator: T): Effect.Effect<z.infer<T>, CaminoError<ZodUnparseable | typeof ouvertureShapeError>> => {
  return pipe(
    Effect.try({
      try: () => {
        const fileContent = readFileSync(pathFrom)

        return parseShp(fileContent)
      },
      catch: () => ({ message: ouvertureShapeError }),
    }),
    Effect.flatMap(zodParseEffectCallback(validator))
  )
}

const readIsoOrUTF8FileSync = (path: string): string => {
  const buffer = readFileSync(path)

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch (e) {
    return new TextDecoder('iso-8859-15', { fatal: true }).decode(buffer)
  }
}

const fileNameToCsv = (pathFrom: string): Effect.Effect<unknown[], CaminoError<typeof ouvertureCsvError>> => {
  return Effect.try({
    try: () => {
      const fileContent = readIsoOrUTF8FileSync(pathFrom)
      const result = xlsx.read(fileContent, { type: 'string', FS: ';', raw: true })

      if (result.SheetNames.length !== 1) {
        throw new Error(`une erreur est survenue lors de la lecture du csv, il ne devrait y avoir qu'un seul document ${result.SheetNames}`)
      }

      const sheet1 = result.Sheets[result.SheetNames[0]]

      return xlsx.utils.sheet_to_json(sheet1, { raw: true })
    },
    catch: e => ({ message: ouvertureCsvError, extra: e }),
  })
}

const accesInterditError = 'Accès interdit' as const
type GeosjsonImportPointsErrorMessages = ZodUnparseable | DbQueryAccessError | typeof accesInterditError | 'Fichier incorrect' | ConvertPointsErrors

export const geojsonImportPoints: RestNewPostCall<'/rest/geojson_points/import/:geoSystemeId'> = ({
  pool,
  user,
  body: geojsonImportInput,
  params,
}): Effect.Effect<GeojsonImportPointsResponse, CaminoApiError<GeosjsonImportPointsErrorMessages>> => {
  return Effect.Do.pipe(
    Effect.filterOrFail(
      () => !isDefault(user),
      () => ({ message: 'Accès interdit' as const })
    ),
    Effect.bind('features', () => {
      return pipe(
        Effect.try({
          try: () => {
            const filename = geojsonImportInput.tempDocumentName
            const pathFrom = join(process.cwd(), `/files/tmp/${filename}`)
            const fileContent = readFileSync(pathFrom)

            return JSON.parse(fileContent.toString())
          },
          catch: () => ({ message: 'Fichier incorrect' as const }),
        }),
        Effect.flatMap(zodParseEffectCallback(featureCollectionPointsValidator))
      )
    }),
    Effect.bind('geojson4326points', ({ features }) => convertPoints(pool, params.geoSystemeId, features)),
    Effect.map(result => ({ geojson4326: result.geojson4326points, origin: result.features })),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when('Accès interdit', () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.when("Impossible d'accéder à la base de données", () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })),
        Match.whenOr(
          'Fichier incorrect',
          'Impossible de transformer la feature collection',
          'La liste des points est vide',
          'Le nombre de points est invalide',
          'Problème de validation de données',
          'Problème de Système géographique (SRID)',
          () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })
        ),
        Match.exhaustive
      )
    )
  )
}

type GeosjsonImportForagesErrorMessages = ZodUnparseable | DbQueryAccessError | typeof ouvertureCsvError | typeof ouvertureShapeError | typeof ouvertureGeoJSONError | ConvertPointsErrors
export const geojsonImportForages: RestNewPostCall<'/rest/geojson_forages/import/:geoSystemeId'> = ({
  pool,
  body,
  params,
}): Effect.Effect<GeojsonImportForagesResponse, CaminoApiError<GeosjsonImportForagesErrorMessages>> => {
  const filename = body.tempDocumentName

  const pathFrom = join(process.cwd(), `/files/tmp/${filename}`)
  const fileType = body.fileType

  return Effect.Do.pipe(
    Effect.bind('features', () =>
      Match.value(fileType).pipe(
        Match.when('geojson', () => fileNameToJson(pathFrom, featureCollectionForagesValidator)),
        Match.when('shp', () => fileNameToShape(pathFrom, featureCollectionForagesValidator)),
        Match.when('csv', () =>
          pipe(
            fileNameToCsv(pathFrom),
            Effect.flatMap(converted => {
              const uniteId = GeoSystemes[params.geoSystemeId].uniteId

              return Match.value(uniteId).pipe(
                Match.when('met', () =>
                  pipe(
                    zodParseEffect(csvForageXYValidator, converted),
                    Effect.map(rows => {
                      const points: FeatureCollectionForages['features'] = rows.map(ligne => ({
                        type: 'Feature',
                        properties: { nom: ligne.nom, description: ligne.description, profondeur: ligne.profondeur, type: ligne.type },
                        geometry: { type: 'Point', coordinates: [ligne.x, ligne.y] },
                      }))

                      return { type: 'FeatureCollection', features: points } as const
                    })
                  )
                ),
                Match.whenOr('gon', 'deg', () =>
                  pipe(
                    zodParseEffect(csvForageDegValidator, converted),
                    Effect.map(rows => {
                      const points: FeatureCollectionForages['features'] = rows.map(ligne => ({
                        type: 'Feature',
                        properties: { nom: ligne.nom, description: ligne.description, profondeur: ligne.profondeur, type: ligne.type },
                        geometry: { type: 'Point', coordinates: [ligne.longitude, ligne.latitude] },
                      }))

                      return { type: 'FeatureCollection', features: points } as const
                    })
                  )
                ),
                Match.exhaustive
              )
            }),
            Effect.flatMap(zodParseEffectCallback(featureCollectionForagesValidator))
          )
        ),
        Match.exhaustive
      )
    ),
    Effect.bind('conversion', ({ features }) => convertPoints(pool, params.geoSystemeId, features)),
    Effect.map(({ conversion, features }) => {
      return { geojson4326: conversion, origin: features }
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when("Impossible d'accéder à la base de données", () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })),
        Match.whenOr(
          'Problème de validation de données',
          'Une erreur est survenue lors de la lecture du csv',
          "Une erreur s'est produite lors de l'ouverture du fichier GeoJSON",
          "Une erreur s'est produite lors de l'ouverture du fichier shape",
          'Impossible de transformer la feature collection',
          'La liste des points est vide',
          'Le nombre de points est invalide',
          'Problème de Système géographique (SRID)',
          () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })
        ),
        Match.exhaustive
      )
    )
  )
}

const getAlertesSuperposition = (
  geojson4326_perimetre: MultiPolygon | null,
  titreTypeId: TitreTypeId,
  titreSlug: TitreSlug,
  user: DeepReadonly<User>,
  pool: Pool
): Effect.Effect<GetTitresIntersectionWithGeojson[], CaminoError<ZodUnparseable | DbQueryAccessError>> => {
  if (titreTypeId === 'axm' && (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && geojson4326_perimetre !== null) {
    // vérifie qu’il n’existe pas de demandes de titres en cours sur ce périmètre
    return getTitresIntersectionWithGeojson(pool, geojson4326_perimetre, titreSlug)
  }

  return Effect.succeed([])
}
