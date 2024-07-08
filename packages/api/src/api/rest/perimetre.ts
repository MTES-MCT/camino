import { DemarcheId, demarcheIdOrSlugValidator } from 'camino-common/src/demarche.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { Pool } from 'pg'
import { pipe, Effect, Exit, Match } from 'effect'
import { GEO_SYSTEME_IDS, GeoSystemeId, GeoSystemes } from 'camino-common/src/static/geoSystemes.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import {
  ConvertPointsErrors,
  GetGeojsonByGeoSystemeIdErrorMessages,
  GetGeojsonInformationErrorMessages,
  GetTitresIntersectionWithGeojson,
  convertPoints,
  getGeojsonByGeoSystemeId as getGeojsonByGeoSystemeIdQuery,
  getGeojsonInformation,
  getTitresIntersectionWithGeojson,
} from './perimetre.queries.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getMostRecentEtapeFondamentaleValide } from './titre-heritage.js'
import { isAdministrationAdmin, isAdministrationEditeur, isDefault, isSuper, User, UserNotNull } from 'camino-common/src/roles.js'
import { getDemarcheByIdOrSlug, getEtapesByDemarcheId } from './demarches.queries.js'
import { getAdministrationsLocalesByTitreId, getTitreByIdOrSlug, getTitulairesAmodiatairesByTitreId } from './titres.queries.js'
import { etapeIdOrSlugValidator } from 'camino-common/src/etape.js'
import { getEtapeById } from './etapes.queries.js'
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
  GeojsonImportPointsBody,
  GeojsonImportBody,
  GeojsonImportForagesBody,
} from 'camino-common/src/perimetre.js'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import shpjs from 'shpjs'
import { DeepReadonly, exhaustiveCheck, isNotNullNorUndefined, isNullOrUndefined, memoize } from 'camino-common/src/typescript-tools.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { TitreSlug } from 'camino-common/src/validators/titres.js'
import { canReadEtape } from './permissions/etapes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import xlsx from 'xlsx'
import { ZodTypeAny, z } from 'zod'
import { CommuneId } from 'camino-common/src/static/communes'
import { CaminoApiError } from '../../types.js'
import { DbQueryAccessError } from '../../pg-database.js'
import { ZodUnparseable, zodParseEffect, zodParseEffectCallback } from '../../tools/fp-tools.js'
import { CaminoError } from 'camino-common/src/zod-tools.js'

export const getPerimetreInfos = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<PerimetreInformations>) => {
  const user = req.auth

  if (!user) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    const etapeIdOrSlugParsed = etapeIdOrSlugValidator.safeParse(req.params.etapeId)
    const demarcheIdOrSlugParsed = demarcheIdOrSlugValidator.safeParse(req.params.demarcheId)

    if (!etapeIdOrSlugParsed.success && !demarcheIdOrSlugParsed.success) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
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
          res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
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
            const superpositionAlertes = await pipe(getAlertesSuperposition(etape.geojson4326_perimetre, titre.titre_type_id, titre.titre_slug, user, pool), Effect.runPromiseExit)
            if (Exit.isSuccess(superpositionAlertes)) {
              res.json({
                superposition_alertes: superpositionAlertes.value,
                sdomZoneIds: etape.sdom_zones,
                communes: etape.communes,
              })
            } else {
              res.status(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR).send(superpositionAlertes.cause)
            }
          } else {
            res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
          }
        }
      } catch (e) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
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
export const geojsonImport = (
  pool: Pool,
  user: DeepReadonly<UserNotNull>,
  body: DeepReadonly<GeojsonImportBody>,
  params: { geoSystemeId: GeoSystemeId }
): Effect.Effect<DeepReadonly<GeojsonInformations>, CaminoApiError<GeojsonImportErrorMessages>> => {
  const pathFrom = join(process.cwd(), `/files/tmp/${body.tempDocumentName}`)

  return pipe(
    Effect.Do.pipe(
      Effect.flatMap<
        Record<string, never>,
        { geojsonOriginFeatureMultiPolygon: FeatureMultiPolygon; geojsonOriginFeatureCollectionPoints: null | FeatureCollectionPoints },
        CaminoError<GeojsonImportErrorMessages>,
        never
      >(() => {
        const fileType = body.fileType
        switch (fileType) {
          case 'geojson': {
            return pipe(
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
          }
          case 'shp': {
            return pipe(
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
          }
          case 'csv': {
            return pipe(
              fileNameToCsv(pathFrom),
              Effect.filterOrFail(
                converted => converted.length <= 20,
                () => ({ message: importCsvRestrictionError })
              ),
              Effect.flatMap(converted => {
                const uniteId = GeoSystemes[params.geoSystemeId].uniteId
                let myPipe
                switch (uniteId) {
                  case 'met': {
                    myPipe = pipe(
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
                    break
                  }
                  case 'gon':
                  case 'deg': {
                    myPipe = pipe(
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
                    break
                  }
                  default: {
                    exhaustiveCheck(uniteId)
                    throw new Error('impossible')
                  }
                }

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
          }
          default:
            exhaustiveCheck(fileType)
            throw new Error('Impossible')
        }
      })
    ),
    Effect.bind('geojson4326MultiPolygon', ({ geojsonOriginFeatureMultiPolygon }) =>
      pipe(
        getGeojsonByGeoSystemeIdQuery(pool, params.geoSystemeId, GEO_SYSTEME_IDS.WGS84, geojsonOriginFeatureMultiPolygon),
        Effect.map(result => result.geometry)
      )
    ),
    Effect.bind('geojson4326FeatureCollectionPoints', ({ geojsonOriginFeatureCollectionPoints }) => {
      if (isNotNullNorUndefined(geojsonOriginFeatureCollectionPoints)) {
        return convertPoints(pool, params.geoSystemeId, GEO_SYSTEME_IDS.WGS84, geojsonOriginFeatureCollectionPoints)
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
          () => ({ ...caminoError, status: HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR })
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
          () => ({ ...caminoError, status: HTTP_STATUS.HTTP_STATUS_BAD_REQUEST })
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

        return shpjs.parseShp(fileContent)
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

export const geojsonImportPoints = (
  pool: Pool,
  user: DeepReadonly<UserNotNull>,
  geojsonImportInput: DeepReadonly<GeojsonImportPointsBody>,
  params: { geoSystemeId: GeoSystemeId }
): Effect.Effect<GeojsonImportPointsResponse, CaminoApiError<GeosjsonImportPointsErrorMessages>> => {
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
    Effect.bind('geojson4326points', ({ features }) => convertPoints(pool, params.geoSystemeId, GEO_SYSTEME_IDS.WGS84, features)),
    Effect.map(result => ({ geojson4326: result.geojson4326points, origin: result.features })),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when('Accès interdit', () => ({ ...caminoError, status: HTTP_STATUS.HTTP_STATUS_FORBIDDEN })),
        Match.when("Impossible d'accéder à la base de données", () => ({ ...caminoError, status: HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR })),
        Match.whenOr(
          'Fichier incorrect',
          'Impossible de transformer la feature collection',
          'La liste des points est vide',
          'Le nombre de points est invalide',
          'Problème de validation de données',
          () => ({ ...caminoError, status: HTTP_STATUS.HTTP_STATUS_BAD_REQUEST })
        ),
        Match.exhaustive
      )
    )
  )
}

type GeosjsonImportForagesErrorMessages = ZodUnparseable | DbQueryAccessError | typeof ouvertureCsvError | typeof ouvertureShapeError | typeof ouvertureGeoJSONError | ConvertPointsErrors
export const geojsonImportForages = (
  pool: Pool,
  _user: DeepReadonly<UserNotNull>,
  body: DeepReadonly<GeojsonImportForagesBody>,
  params: { geoSystemeId: GeoSystemeId }
): Effect.Effect<GeojsonImportForagesResponse, CaminoApiError<GeosjsonImportForagesErrorMessages>> => {
  const filename = body.tempDocumentName

  const pathFrom = join(process.cwd(), `/files/tmp/${filename}`)
  const fileType = body.fileType

  return Effect.Do.pipe(
    Effect.bind('features', () => {
      let featuresPipe: Effect.Effect<z.infer<typeof featureCollectionForagesValidator>, CaminoError<GeosjsonImportForagesErrorMessages>>
      switch (fileType) {
        case 'geojson': {
          featuresPipe = fileNameToJson(pathFrom, featureCollectionForagesValidator)
          break
        }
        case 'shp': {
          featuresPipe = fileNameToShape(pathFrom, featureCollectionForagesValidator)
          break
        }
        case 'csv': {
          featuresPipe = pipe(
            fileNameToCsv(pathFrom),
            Effect.flatMap(converted => {
              const uniteId = GeoSystemes[params.geoSystemeId].uniteId
              switch (uniteId) {
                case 'met': {
                  return pipe(
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
                }
                case 'gon':
                case 'deg': {
                  return pipe(
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
                }
                default:
                  exhaustiveCheck(uniteId)
                  throw new Error('Cas impossible mais typescript ne voit pas que exhaustiveCheck throw une exception')
              }
            }),
            Effect.flatMap(zodParseEffectCallback(featureCollectionForagesValidator))
          )
          break
        }

        default: {
          exhaustiveCheck(fileType)
          throw new Error('Cas impossible mais typescript ne voit pas que exhaustiveCheck throw une exception')
        }
      }

      return featuresPipe
    }),
    Effect.bind('conversion', ({ features }) => convertPoints(pool, params.geoSystemeId, GEO_SYSTEME_IDS.WGS84, features)),
    Effect.map(({ conversion, features }) => {
      return { geojson4326: conversion, origin: features }
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when("Impossible d'accéder à la base de données", () => ({ ...caminoError, status: HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR })),
        Match.whenOr(
          'Problème de validation de données',
          'Une erreur est survenue lors de la lecture du csv',
          "Une erreur s'est produite lors de l'ouverture du fichier GeoJSON",
          "Une erreur s'est produite lors de l'ouverture du fichier shape",
          'Impossible de transformer la feature collection',
          'La liste des points est vide',
          'Le nombre de points est invalide',
          () => ({ ...caminoError, status: HTTP_STATUS.HTTP_STATUS_BAD_REQUEST })
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
