import { DemarcheId, demarcheIdOrSlugValidator } from 'camino-common/src/demarche.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { Pool } from 'pg'
import { GEO_SYSTEME_IDS, transformableGeoSystemeIdValidator } from 'camino-common/src/static/geoSystemes.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { getGeojsonByGeoSystemeId as getGeojsonByGeoSystemeIdQuery, getGeojsonInformation, getTitresIntersectionWithGeojson } from './perimetre.queries.js'
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
  featureCollectionValidator,
  featureMultiPolygonValidator,
  geojsonImportBodyValidator,
  multiPolygonValidator,
  polygonCoordinatesValidator,
} from 'camino-common/src/perimetre.js'
import { join } from 'node:path'
import { createReadStream } from 'node:fs'
import shpjs from 'shpjs'
import { Stream } from 'node:stream'
import { isNotNullNorUndefined, isNullOrUndefined, memoize } from 'camino-common/src/typescript-tools.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { TitreSlug } from 'camino-common/src/validators/titres.js'
import { canReadEtape } from './permissions/etapes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { z } from 'zod'

export const getGeojsonByGeoSystemeId = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<FeatureMultiPolygon>) => {
  const geoSystemeIdParsed = transformableGeoSystemeIdValidator.safeParse(req.params.geoSystemeId)
  const geojsonParsed = featureMultiPolygonValidator.safeParse(req.body)

  if (!geoSystemeIdParsed.success || !geojsonParsed.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      res.json(await getGeojsonByGeoSystemeIdQuery(pool, GEO_SYSTEME_IDS.WGS84, geoSystemeIdParsed.data, geojsonParsed.data))
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

const stream2buffer = async (stream: Stream): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = [] as any[]

    stream.on('data', chunk => _buf.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(_buf)))
    stream.on('error', err => reject(new Error(`error converting stream - ${err}`)))
  })
}

export const geojsonImport = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<GeojsonInformations>) => {
  const user = req.auth

  const geoSystemeId = transformableGeoSystemeIdValidator.safeParse(req.params.geoSystemeId)
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
        const fileStream = createReadStream(pathFrom)

        const buffer = await stream2buffer(fileStream)

        let coordinates: [number, number][][][]
        let featureCollectionPoints: null | FeatureCollectionPoints = null
        if (geojsonImportInput.data.fileType === 'geojson') {
          const features = featureCollectionValidator.parse(JSON.parse(buffer.toString()))

          coordinates = (await getGeojsonByGeoSystemeIdQuery(pool, geoSystemeId.data, GEO_SYSTEME_IDS.WGS84, features.features[0])).geometry.coordinates
          // TODO 2024-01-24 on importe les points que si le référentiel est en 4326
          if (geoSystemeId.data === '4326' && features.features.length > 1) {
            const [_multi, ...points] = features.features
            featureCollectionPoints = { type: 'FeatureCollection', features: points }
          }
        } else {
          const shapeValidator = z
            .array(z.object({ coordinates: polygonCoordinatesValidator, type: z.literal('Polygon') }).or(multiPolygonValidator))
            .max(1)
            .min(1)
          const shpParsed = shpjs.parseShp(buffer, 'EPSG:4326')

          const shapePolygonOrMultipolygon = shapeValidator.parse(shpParsed)[0]

          if (shapePolygonOrMultipolygon.type === 'MultiPolygon') {
            coordinates = shapePolygonOrMultipolygon.coordinates
          } else {
            coordinates = [shapePolygonOrMultipolygon.coordinates]
          }
        }

        const geojson: MultiPolygon = { type: 'MultiPolygon', coordinates }

        const geoInfo = await getGeojsonInformation(pool, geojson)
        const result: GeojsonInformations = {
          superposition_alertes: await getAlertesSuperposition(geojson, geojsonImportInput.data.titreTypeId, geojsonImportInput.data.titreSlug, user, pool),
          communes: geoInfo.communes,
          foretIds: geoInfo.forets,
          sdomZoneIds: geoInfo.sdom,
          secteurMaritimeIds: geoInfo.secteurs,
          surface: geoInfo.surface,
          geojson4326_perimetre: { type: 'Feature', geometry: geojson, properties: {} },
          geojson4326_points: featureCollectionPoints,
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

const getAlertesSuperposition = async (geojson4326_perimetre: MultiPolygon | null, titreTypeId: TitreTypeId, titreSlug: TitreSlug, user: User, pool: Pool) => {
  if (titreTypeId === 'axm' && (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && geojson4326_perimetre !== null) {
    // vérifie qu’il n’existe pas de demandes de titres en cours sur ce périmètre
    return getTitresIntersectionWithGeojson(pool, geojson4326_perimetre, titreSlug)
  }

  return []
}
