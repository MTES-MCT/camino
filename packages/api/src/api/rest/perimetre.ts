import { DemarcheId, demarcheIdOrSlugValidator } from 'camino-common/src/demarche.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { Pool } from 'pg'
import TE from 'fp-ts/lib/TaskEither.js'
import { pipe } from 'fp-ts/lib/function.js'
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
import E, { isRight } from 'fp-ts/lib/Either.js'
import { ZodUnparseable, zodParseEither, zodParseEitherCallback } from '../../tools/fp-tools.js'
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
            const superpositionAlertes = await getAlertesSuperposition(etape.geojson4326_perimetre, titre.titre_type_id, titre.titre_slug, user, pool)()
            if (isRight(superpositionAlertes)) {
              res.json({
                superposition_alertes: superpositionAlertes.right,
                sdomZoneIds: etape.sdom_zones,
                communes: etape.communes,
              })
            } else {
              res.status(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR).send(superpositionAlertes.left)
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
): TE.TaskEither<CaminoApiError<GeojsonImportErrorMessages>, DeepReadonly<GeojsonInformations>> => {
  const pathFrom = join(process.cwd(), `/files/tmp/${body.tempDocumentName}`)

  return pipe(
    TE.fromEither(
      pipe(
        E.Do,
        E.flatMap<
          Record<string, never>,
          CaminoError<GeojsonImportErrorMessages>,
          { geojsonOriginFeatureMultiPolygon: FeatureMultiPolygon; geojsonOriginFeatureCollectionPoints: null | FeatureCollectionPoints }
        >(() => {
          const fileType = body.fileType
          switch (fileType) {
            case 'geojson': {
              return pipe(
                fileNameToJson(pathFrom, geojsonValidator),
                E.flatMap(features =>
                  E.tryCatch(
                    () => {
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
                    e => ({ message: extractionGeoJSONError, extra: e })
                  )
                )
              )
            }
            case 'shp': {
              return pipe(
                fileNameToShape(pathFrom, shapeValidator),
                E.flatMap(shapePolygonOrMultipolygons =>
                  E.tryCatch(
                    () => {
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
                    e => ({ message: extractionShapeError, extra: e })
                  )
                )
              )
            }
            case 'csv': {
              return pipe(
                fileNameToCsv(pathFrom),
                E.filterOrElseW(
                  converted => converted.length <= 20,
                  () => ({ message: importCsvRestrictionError })
                ),
                E.flatMap(converted => {
                  const uniteId = GeoSystemes[params.geoSystemeId].uniteId
                  let myPipe
                  switch (uniteId) {
                    case 'met': {
                      myPipe = pipe(
                        zodParseEither(csvXYValidator, converted),
                        E.flatMap(rows =>
                          E.tryCatch(
                            () => {
                              const coordinates: MultiPolygon['coordinates'] = [[rows.map(({ x, y }) => [x, y])]]
                              const points: FeatureCollectionPoints['features'] = rows.map(ligne => ({
                                type: 'Feature',
                                properties: { nom: ligne.nom, description: ligne.description },
                                geometry: { type: 'Point', coordinates: [ligne.x, ligne.y] },
                              }))

                              coordinates[0][0].push([rows[0].x, rows[0].y])

                              return { coordinates, points }
                            },
                            e => ({ message: recuperationInfoCsvError, extra: e })
                          )
                        )
                      )
                      break
                    }
                    case 'gon':
                    case 'deg': {
                      myPipe = pipe(
                        zodParseEither(csvLatLongValidator, converted),
                        E.flatMap(rows =>
                          E.tryCatch(
                            () => {
                              const coordinates: MultiPolygon['coordinates'] = [[rows.map(({ longitude, latitude }) => [longitude, latitude])]]
                              const points: FeatureCollectionPoints['features'] = rows.map(ligne => ({
                                type: 'Feature',
                                properties: { nom: ligne.nom, description: ligne.description },
                                geometry: { type: 'Point', coordinates: [ligne.longitude, ligne.latitude] },
                              }))
                              coordinates[0][0].push([rows[0].longitude, rows[0].latitude])

                              return { coordinates, points }
                            },
                            e => ({ message: recuperationInfoCsvError, extra: e })
                          )
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
                    E.flatMap(({ coordinates, points }) => {
                      const geojsonOriginFeatureMultiPolygon: FeatureMultiPolygon = { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates } }
                      const geojsonOriginFeatureCollectionPoints: FeatureCollectionPoints = { type: 'FeatureCollection', features: points }

                      return E.right({ geojsonOriginFeatureMultiPolygon, geojsonOriginFeatureCollectionPoints })
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
      )
    ),
    TE.bindW('geojson4326MultiPolygon', ({ geojsonOriginFeatureMultiPolygon }) =>
      pipe(
        getGeojsonByGeoSystemeIdQuery(pool, params.geoSystemeId, GEO_SYSTEME_IDS.WGS84, geojsonOriginFeatureMultiPolygon),
        TE.map(result => result.geometry)
      )
    ),
    TE.bindW('geojson4326FeatureCollectionPoints', ({ geojsonOriginFeatureCollectionPoints }) => {
      if (isNotNullNorUndefined(geojsonOriginFeatureCollectionPoints)) {
        return convertPoints(pool, params.geoSystemeId, GEO_SYSTEME_IDS.WGS84, geojsonOriginFeatureCollectionPoints)
      }

      return TE.right(null)
    }),
    TE.bindW('geoInfo', ({ geojson4326MultiPolygon }) => getGeojsonInformation(pool, geojson4326MultiPolygon)),
    TE.bindW('alertesSuperposition', ({ geojson4326MultiPolygon }) => getAlertesSuperposition(geojson4326MultiPolygon, body.titreTypeId, body.titreSlug, user, pool)),
    TE.map(({ geojson4326MultiPolygon, geojson4326FeatureCollectionPoints, geoInfo, alertesSuperposition, geojsonOriginFeatureMultiPolygon, geojsonOriginFeatureCollectionPoints }) => {
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
    TE.mapLeft(caminoError => {
      const message = caminoError.message
      switch (message) {
        case 'Une erreur est survenue lors de la lecture du csv':
        case 'Une erreur est survenue lors de la récupération des informations du CSV':
        case 'Une erreur inattendue est survenue lors de la récupération des informations geojson en base':
        case "Impossible d'accéder à la base de données":
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR }
        case 'Problème de validation de données':
        case "Une erreur s'est produite lors de l'ouverture du fichier GeoJSON":
        case "Une erreur s'est produite lors de l'ouverture du fichier shape":
        case 'Impossible de convertir la géométrie en JSON':
        case 'Impossible de convertir le geojson vers le système':
        case "L'import CSV est fait pour des petits polygones simple de moins de 20 sommets":
        case "Le périmètre n'est pas valide dans le référentiel donné":
        case "Une erreur s'est produite lors de l'extraction du multi-polygone du fichier GeoJSON":
        case "Une erreur s'est produite lors de l'extraction du multi-polygone du fichier shape":
        case 'Impossible de transformer la feature collection':
        case 'La liste des points est vide':
        case 'Le nombre de points est invalide':
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_BAD_REQUEST }
        default:
          exhaustiveCheck(message)
          throw new Error('impossible')
      }
    })
  )
}
const fileNameToJson = <T extends ZodTypeAny>(pathFrom: string, validator: T): E.Either<CaminoError<ZodUnparseable | typeof ouvertureGeoJSONError>, z.infer<T>> => {
  return pipe(
    E.tryCatch(
      () => {
        const fileContent = readFileSync(pathFrom)

        return JSON.parse(fileContent.toString())
      },
      () => ({ message: ouvertureGeoJSONError })
    ),
    E.flatMap(zodParseEitherCallback(validator))
  )
}
const fileNameToShape = <T extends ZodTypeAny>(pathFrom: string, validator: T): E.Either<CaminoError<ZodUnparseable | typeof ouvertureShapeError>, z.infer<T>> => {
  return pipe(
    E.tryCatch(
      () => {
        const fileContent = readFileSync(pathFrom)

        return shpjs.parseShp(fileContent)
      },
      () => ({ message: ouvertureShapeError })
    ),
    E.flatMap(zodParseEitherCallback(validator))
  )
}
const fileNameToCsv = (pathFrom: string): E.Either<CaminoError<typeof ouvertureCsvError>, unknown[]> => {
  return E.tryCatch(
    () => {
      const fileContent = readFileSync(pathFrom, { encoding: 'utf-8' })
      const result = xlsx.read(fileContent, { type: 'string', FS: ';', raw: true })

      if (result.SheetNames.length !== 1) {
        throw new Error(`une erreur est survenue lors de la lecture du csv, il ne devrait y avoir qu'un seul document ${result.SheetNames}`)
      }

      const sheet1 = result.Sheets[result.SheetNames[0]]

      return xlsx.utils.sheet_to_json(sheet1, { raw: true })
    },
    e => ({ message: ouvertureCsvError, extra: e })
  )
}

type GeosjsonImportPointsErrorMessages = ZodUnparseable | DbQueryAccessError | 'Accès interdit' | 'Fichier incorrect' | ConvertPointsErrors
export const geojsonImportPoints = (
  pool: Pool,
  user: DeepReadonly<UserNotNull>,
  geojsonImportInput: DeepReadonly<GeojsonImportPointsBody>,
  params: { geoSystemeId: GeoSystemeId }
): TE.TaskEither<CaminoApiError<GeosjsonImportPointsErrorMessages>, GeojsonImportPointsResponse> => {
  return pipe(
    TE.Do,
    TE.filterOrElseW(
      () => !isDefault(user),
      () => ({ message: 'Accès interdit' as const })
    ),
    TE.bindW('features', () => {
      return TE.fromEither(
        pipe(
          E.tryCatch(
            () => {
              const filename = geojsonImportInput.tempDocumentName
              const pathFrom = join(process.cwd(), `/files/tmp/${filename}`)
              const fileContent = readFileSync(pathFrom)

              return JSON.parse(fileContent.toString())
            },
            () => ({ message: 'Fichier incorrect' as const })
          ),
          E.flatMap(zodParseEitherCallback(featureCollectionPointsValidator))
        )
      )
    }),
    TE.bindW('geojson4326points', ({ features }) => convertPoints(pool, params.geoSystemeId, GEO_SYSTEME_IDS.WGS84, features)),
    TE.map(result => ({ geojson4326: result.geojson4326points, origin: result.features })),
    TE.mapLeft(caminoError => {
      const message = caminoError.message
      switch (message) {
        case 'Accès interdit':
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_FORBIDDEN }
        case "Impossible d'accéder à la base de données":
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR }
        case 'Problème de validation de données':
        case 'Fichier incorrect':
        case 'Impossible de transformer la feature collection':
        case 'La liste des points est vide':
        case 'Le nombre de points est invalide':
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_BAD_REQUEST }
        default:
          exhaustiveCheck(message)
          throw new Error('impossible')
      }
    })
  )
}

type GeosjsonImportForagesErrorMessages = ZodUnparseable | DbQueryAccessError | typeof ouvertureCsvError | typeof ouvertureShapeError | typeof ouvertureGeoJSONError | ConvertPointsErrors
export const geojsonImportForages = (
  pool: Pool,
  _user: DeepReadonly<UserNotNull>,
  body: DeepReadonly<GeojsonImportForagesBody>,
  params: { geoSystemeId: GeoSystemeId }
): TE.TaskEither<CaminoApiError<GeosjsonImportForagesErrorMessages>, GeojsonImportForagesResponse> => {
  const filename = body.tempDocumentName

  const pathFrom = join(process.cwd(), `/files/tmp/${filename}`)
  const fileType = body.fileType

  return pipe(
    TE.Do,
    TE.bindW<'features', object, CaminoError<GeosjsonImportForagesErrorMessages>, FeatureCollectionForages>('features', () => {
      let myPipe: E.Either<CaminoError<GeosjsonImportForagesErrorMessages>, z.infer<typeof featureCollectionForagesValidator>>
      switch (fileType) {
        case 'geojson': {
          myPipe = fileNameToJson(pathFrom, featureCollectionForagesValidator)
          break
        }
        case 'shp': {
          myPipe = fileNameToShape(pathFrom, featureCollectionForagesValidator)
          break
        }
        case 'csv': {
          myPipe = pipe(
            fileNameToCsv(pathFrom),
            E.flatMap(converted => {
              const uniteId = GeoSystemes[params.geoSystemeId].uniteId
              switch (uniteId) {
                case 'met': {
                  return pipe(
                    zodParseEither(csvForageXYValidator, converted),
                    E.map(rows => {
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
                    zodParseEither(csvForageDegValidator, converted),
                    E.map(rows => {
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
            E.flatMap(zodParseEitherCallback(featureCollectionForagesValidator))
          )
          break
        }

        default: {
          exhaustiveCheck(fileType)
          throw new Error('Cas impossible mais typescript ne voit pas que exhaustiveCheck throw une exception')
        }
      }

      return TE.fromEither(myPipe)
    }),
    TE.bindW('conversion', ({ features }) => convertPoints(pool, params.geoSystemeId, GEO_SYSTEME_IDS.WGS84, features)),
    TE.map(({ conversion, features }) => {
      return { geojson4326: conversion, origin: features }
    }),
    TE.mapLeft(caminoError => {
      const message = caminoError.message
      switch (message) {
        case "Impossible d'accéder à la base de données":
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR }
        case 'Problème de validation de données':
        case 'Une erreur est survenue lors de la lecture du csv':
        case "Une erreur s'est produite lors de l'ouverture du fichier GeoJSON":
        case "Une erreur s'est produite lors de l'ouverture du fichier shape":
        case 'Impossible de transformer la feature collection':
        case 'La liste des points est vide':
        case 'Le nombre de points est invalide':
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_BAD_REQUEST }
        default:
          exhaustiveCheck(message)
          throw new Error('impossible')
      }
    })
  )
}

const getAlertesSuperposition = (
  geojson4326_perimetre: MultiPolygon | null,
  titreTypeId: TitreTypeId,
  titreSlug: TitreSlug,
  user: DeepReadonly<User>,
  pool: Pool
): TE.TaskEither<CaminoError<ZodUnparseable | DbQueryAccessError>, GetTitresIntersectionWithGeojson[]> => {
  if (titreTypeId === 'axm' && (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && geojson4326_perimetre !== null) {
    // vérifie qu’il n’existe pas de demandes de titres en cours sur ce périmètre
    return getTitresIntersectionWithGeojson(pool, geojson4326_perimetre, titreSlug)
  }

  return TE.right([])
}
