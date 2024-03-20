import { DemarcheId, demarcheIdOrSlugValidator } from 'camino-common/src/demarche.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { Pool } from 'pg'
import { GEO_SYSTEME_IDS, GeoSystemes, geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { convertPoints, getGeojsonByGeoSystemeId as getGeojsonByGeoSystemeIdQuery, getGeojsonInformation, getTitresIntersectionWithGeojson } from './perimetre.queries.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getMostRecentEtapeFondamentaleValide } from './titre-heritage.js'
import { isAdministrationAdmin, isAdministrationEditeur, isDefault, isSuper, User } from 'camino-common/src/roles.js'
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
  geojsonImportBodyValidator,
  geojsonImportPointBodyValidator,
  multiPolygonValidator,
  polygonValidator,
  featureCollectionPolygonValidator,
  GeojsonImportPointsResponse,
  GeojsonImportForagesResponse,
  featureCollectionForagesValidator,
  FeatureCollectionForages,
  featureForagePropertiesValidator,
  geojsonImportForagesBodyValidator,
} from 'camino-common/src/perimetre.js'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import shpjs from 'shpjs'
import { exhaustiveCheck, isNotNullNorUndefined, isNullOrUndefined, memoize } from 'camino-common/src/typescript-tools.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { TitreSlug } from 'camino-common/src/validators/titres.js'
import { canReadEtape } from './permissions/etapes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import xlsx from 'xlsx'
import { ZodTypeAny, z } from 'zod'

export const convertGeojsonPointsToGeoSystemeId = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<FeatureCollectionPoints>) => {
  const geoSystemeIdParsed = geoSystemeIdValidator.safeParse(req.params.geoSystemeId)
  const geojsonParsed = featureCollectionPointsValidator.safeParse(req.body)

  if (!geoSystemeIdParsed.success || !geojsonParsed.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      res.json(await convertPoints(pool, GEO_SYSTEME_IDS.WGS84, geoSystemeIdParsed.data, geojsonParsed.data))
    } catch (e) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      console.error(e)
    }
  }
}

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
        let etape: null | { demarche_id: DemarcheId; geojson4326_perimetre: MultiPolygon | null; sdom_zones: SDOMZoneId[]; etape_type_id: EtapeTypeId } = null
        if (etapeIdOrSlugParsed.success) {
          const myEtape = await getEtapeById(pool, etapeIdOrSlugParsed.data)

          etape = { demarche_id: myEtape.demarche_id, geojson4326_perimetre: myEtape.geojson4326_perimetre, sdom_zones: myEtape.sdom_zones ?? [], etape_type_id: myEtape.etape_type_id }
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
            res.json({
              superposition_alertes: await getAlertesSuperposition(etape.geojson4326_perimetre, titre.titre_type_id, titre.titre_slug, user, pool),
              sdomZoneIds: etape.sdom_zones,
            })
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

const tuple4326CoordinateValidator = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
const polygon4326CoordinatesValidator = z.array(z.array(tuple4326CoordinateValidator).min(3)).min(1)

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

export const geojsonImport = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<GeojsonInformations>) => {
  const user = req.auth

  const geoSystemeId = geoSystemeIdValidator.safeParse(req.params.geoSystemeId)
  if (!user || isDefault(user)) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!geoSystemeId.success) {
    console.warn(`le geoSystemeId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    const geojsonImportInput = geojsonImportBodyValidator.safeParse(req.body)

    if (geojsonImportInput.success) {
      try {
        const filename = geojsonImportInput.data.tempDocumentName

        const pathFrom = join(process.cwd(), `/files/tmp/${filename}`)

        let geojsonOriginFeatureMultiPolygon: FeatureMultiPolygon
        let geojsonOriginFeatureCollectionPoints: null | FeatureCollectionPoints = null
        const fileType = geojsonImportInput.data.fileType
        switch (fileType) {
          case 'geojson': {
            const fileContent = readFileSync(pathFrom)
            const features = geojsonValidator.parse(JSON.parse(fileContent.toString()))

            const firstGeometry = features.features[0].geometry
            const multiPolygon: MultiPolygon = firstGeometry.type === 'Polygon' ? { type: 'MultiPolygon', coordinates: [firstGeometry.coordinates] } : firstGeometry

            geojsonOriginFeatureMultiPolygon = { type: 'Feature', properties: {}, geometry: multiPolygon }

            // On a des points après le multipolygone
            if (features.features.length > 1) {
              const [_multi, ...points] = features.features
              geojsonOriginFeatureCollectionPoints = { type: 'FeatureCollection', features: points }
            }

            break
          }

          case 'shp': {
            const fileContent = readFileSync(pathFrom)
            const shpParsed = shpjs.parseShp(fileContent)

            const shapePolygonOrMultipolygon = shapeValidator.parse(shpParsed)[0]

            let coordinates: [number, number][][][]
            if (shapePolygonOrMultipolygon.type === 'MultiPolygon') {
              coordinates = shapePolygonOrMultipolygon.coordinates
            } else {
              coordinates = [shapePolygonOrMultipolygon.coordinates]
            }
            geojsonOriginFeatureMultiPolygon = { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates }, properties: {} }

            break
          }

          case 'csv': {
            const fileContent = readFileSync(pathFrom, { encoding: 'utf-8' })
            const result = xlsx.read(fileContent, { type: 'string', FS: ';', raw: true })

            if (result.SheetNames.length !== 1) {
              throw new Error(`une erreur est survenue lors de la lecture du csv, il ne devrait y avoir qu'un seul document ${result.SheetNames}`)
            }
            const sheet1 = result.Sheets[result.SheetNames[0]]
            const converted = xlsx.utils.sheet_to_json(sheet1, { raw: true })
            const uniteId = GeoSystemes[geoSystemeId.data].uniteId

            if (converted.length > 20) {
              throw new Error(`L'import CSV est fait pour des petits polygones simple de moins de 20 sommets`)
            }

            let coordinates: MultiPolygon['coordinates']
            let points: FeatureCollectionPoints['features']
            switch (uniteId) {
              case 'met': {
                const csvMetreToJsonValidator = makeCsvToJsonValidator(csvCommonLowerValidator.extend({ x: csvInputNumberValidator, y: csvInputNumberValidator }))
                const rows = csvMetreToJsonValidator.parse(converted)
                coordinates = [[rows.map(({ x, y }) => [x, y])]]
                points = rows.map(ligne => ({
                  type: 'Feature',
                  properties: { nom: ligne.nom, description: ligne.description },
                  geometry: { type: 'Point', coordinates: [ligne.x, ligne.y] },
                }))

                coordinates[0][0].push([rows[0].x, rows[0].y])
                break
              }
              case 'gon':
              case 'deg': {
                const csvDegToJsonValidator = makeCsvToJsonValidator(csvCommonLowerValidator.extend({ longitude: csvInputNumberValidator, latitude: csvInputNumberValidator }))
                const rows = csvDegToJsonValidator.parse(converted)
                coordinates = [[rows.map(({ longitude, latitude }) => [longitude, latitude])]]
                points = rows.map(ligne => ({
                  type: 'Feature',
                  properties: { nom: ligne.nom, description: ligne.description },
                  geometry: { type: 'Point', coordinates: [ligne.longitude, ligne.latitude] },
                }))
                coordinates[0][0].push([rows[0].longitude, rows[0].latitude])
                break
              }
              default:
                exhaustiveCheck(uniteId)
                throw new Error('Cas impossible mais typescript ne voit pas que exhaustiveCheck throw une exception')
            }
            geojsonOriginFeatureMultiPolygon = { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates } }
            geojsonOriginFeatureCollectionPoints = { type: 'FeatureCollection', features: points }
            break
          }
          default: {
            exhaustiveCheck(fileType)
            throw new Error('Cas impossible mais typescript ne voit pas que exhaustiveCheck throw une exception')
          }
        }
        const geojson4326FeatureMultiPolygon = await getGeojsonByGeoSystemeIdQuery(pool, geoSystemeId.data, GEO_SYSTEME_IDS.WGS84, geojsonOriginFeatureMultiPolygon)
        const geojson4326FeatureCollectionPoints =
          geojsonOriginFeatureCollectionPoints !== null ? await convertPoints(pool, geoSystemeId.data, GEO_SYSTEME_IDS.WGS84, geojsonOriginFeatureCollectionPoints) : null

        const geojson4326MultiPolygon: MultiPolygon = geojson4326FeatureMultiPolygon.geometry

        z.array(polygon4326CoordinatesValidator).min(1).parse(geojson4326MultiPolygon.coordinates)

        const geoInfo = await getGeojsonInformation(pool, geojson4326MultiPolygon)
        const result: GeojsonInformations = {
          superposition_alertes: await getAlertesSuperposition(geojson4326MultiPolygon, geojsonImportInput.data.titreTypeId, geojsonImportInput.data.titreSlug, user, pool),
          communes: geoInfo.communes,
          foretIds: geoInfo.forets,
          sdomZoneIds: geoInfo.sdom,
          secteurMaritimeIds: geoInfo.secteurs,
          surface: geoInfo.surface,
          geojson4326_perimetre: { type: 'Feature', geometry: geojson4326MultiPolygon, properties: {} },
          geojson4326_points: geojson4326FeatureCollectionPoints,
          geojson_origine_perimetre: geojsonOriginFeatureMultiPolygon,
          geojson_origine_points: geojsonOriginFeatureCollectionPoints,
          geojson_origine_geo_systeme_id: geoSystemeId.data,
        }

        res.json(result)
      } catch (e: any) {
        console.error(e)
        res.status(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST).send(e)
      }
    } else {
      res.status(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST).send(geojsonImportInput.error)
    }
  }
}

export const geojsonImportPoints = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<GeojsonImportPointsResponse>) => {
  const user = req.auth

  const geoSystemeId = geoSystemeIdValidator.safeParse(req.params.geoSystemeId)
  if (!user || isDefault(user)) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!geoSystemeId.success) {
    console.warn(`le geoSystemeId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    const geojsonImportInput = geojsonImportPointBodyValidator.safeParse(req.body)

    if (geojsonImportInput.success) {
      try {
        const filename = geojsonImportInput.data.tempDocumentName

        const pathFrom = join(process.cwd(), `/files/tmp/${filename}`)
        const fileContent = readFileSync(pathFrom)
        const features = featureCollectionPointsValidator.parse(JSON.parse(fileContent.toString()))
        const conversion = await convertPoints(pool, geoSystemeId.data, GEO_SYSTEME_IDS.WGS84, features)
        res.json({ geojson4326: conversion, origin: features })
      } catch (e: any) {
        console.error(e)
        res.status(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST).send(e)
      }
    } else {
      res.status(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST).send(geojsonImportInput.error)
    }
  }
}

export const geojsonImportForages = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<GeojsonImportForagesResponse>) => {
  const user = req.auth

  const geoSystemeId = geoSystemeIdValidator.safeParse(req.params.geoSystemeId)
  if (!user || isDefault(user)) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!geoSystemeId.success) {
    console.warn(`le geoSystemeId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    const geojsonImportInput = geojsonImportForagesBodyValidator.safeParse(req.body)

    if (geojsonImportInput.success) {
      try {
        const filename = geojsonImportInput.data.tempDocumentName

        const pathFrom = join(process.cwd(), `/files/tmp/${filename}`)
        const fileType = geojsonImportInput.data.fileType
        let features: FeatureCollectionForages
        switch (fileType) {
          case 'geojson': {
            const fileContent = readFileSync(pathFrom)
            features = featureCollectionForagesValidator.parse(JSON.parse(fileContent.toString()))

            break
          }

          case 'shp': {
            const fileContent = readFileSync(pathFrom)
            const shpParsed = shpjs.parseShp(fileContent)
            features = featureCollectionForagesValidator.parse(shpParsed)

            break
          }

          case 'csv': {
            const fileContent = readFileSync(pathFrom, { encoding: 'utf-8' })
            const result = xlsx.read(fileContent, { type: 'string', FS: ';', raw: true })

            if (result.SheetNames.length !== 1) {
              throw new Error(`une erreur est survenue lors de la lecture du csv, il ne devrait y avoir qu'un seul document ${result.SheetNames}`)
            }
            const sheet1 = result.Sheets[result.SheetNames[0]]
            const converted = xlsx.utils.sheet_to_json(sheet1, { raw: true })
            const uniteId = GeoSystemes[geoSystemeId.data].uniteId

            let coordinates: MultiPolygon['coordinates']
            let points: FeatureCollectionForages['features']

            switch (uniteId) {
              case 'met': {
                const csvMetreToJsonValidator = makeCsvToJsonValidator(
                  featureForagePropertiesValidator.omit({ profondeur: true }).extend({ x: csvInputNumberValidator, y: csvInputNumberValidator, profondeur: csvInputNumberValidator })
                )

                const rows = csvMetreToJsonValidator.parse(converted)
                coordinates = [[rows.map(({ x, y }) => [x, y])]]
                points = rows.map(ligne => ({
                  type: 'Feature',
                  properties: { nom: ligne.nom, description: ligne.description, profondeur: ligne.profondeur, type: ligne.type },
                  geometry: { type: 'Point', coordinates: [ligne.x, ligne.y] },
                }))

                coordinates[0][0].push([rows[0].x, rows[0].y])
                break
              }
              case 'gon':
              case 'deg': {
                const csvDegToJsonValidator = makeCsvToJsonValidator(
                  featureForagePropertiesValidator.omit({ profondeur: true }).extend({ longitude: csvInputNumberValidator, latitude: csvInputNumberValidator, profondeur: csvInputNumberValidator })
                )
                const rows = csvDegToJsonValidator.parse(converted)
                coordinates = [[rows.map(({ longitude, latitude }) => [longitude, latitude])]]
                points = rows.map(ligne => ({
                  type: 'Feature',
                  properties: { nom: ligne.nom, description: ligne.description, profondeur: ligne.profondeur, type: ligne.type },
                  geometry: { type: 'Point', coordinates: [ligne.longitude, ligne.latitude] },
                }))
                coordinates[0][0].push([rows[0].longitude, rows[0].latitude])
                break
              }
              default:
                exhaustiveCheck(uniteId)
                throw new Error('Cas impossible mais typescript ne voit pas que exhaustiveCheck throw une exception')
            }
            features = { type: 'FeatureCollection', features: points }
            break
          }
          default: {
            exhaustiveCheck(fileType)
            throw new Error('Cas impossible mais typescript ne voit pas que exhaustiveCheck throw une exception')
          }
        }

        const conversion = await convertPoints(pool, geoSystemeId.data, GEO_SYSTEME_IDS.WGS84, features)
        res.json({ geojson4326: conversion, origin: features })
      } catch (e: any) {
        console.error(e)
        res.status(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST).send(e)
      }
    } else {
      res.status(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST).send(geojsonImportInput.error)
    }
  }
}

const getAlertesSuperposition = async (geojson4326_perimetre: MultiPolygon | null, titreTypeId: TitreTypeId, titreSlug: TitreSlug, user: User, pool: Pool) => {
  if (titreTypeId === 'axm' && (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && geojson4326_perimetre !== null) {
    // vérifie qu’il n’existe pas de demandes de titres en cours sur ce périmètre
    return getTitresIntersectionWithGeojson(pool, geojson4326_perimetre, titreSlug)
  }

  return []
}
