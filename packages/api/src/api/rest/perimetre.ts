import { DemarcheId,  demarcheIdValidator } from 'camino-common/src/demarche.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { Pool } from 'pg'
import { GEO_SYSTEME_IDS, transformableGeoSystemeIdValidator } from 'camino-common/src/static/geoSystemes.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { getGeojsonByGeoSystemeId as getGeojsonByGeoSystemeIdQuery, getGeojsonInformation, getTitresIntersectionWithGeojson } from './perimetre.queries.js'
import { EtapeTypeId, etapeTypeIdValidator, isEtapeTypeIdFondamentale } from 'camino-common/src/static/etapesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getMostRecentEtapeFondamentaleValide } from 'camino-common/src/titres.js'
import { isAdministrationAdmin, isAdministrationEditeur, isSuper, User } from 'camino-common/src/roles.js'
import { getDemarcheByIdOrSlug, getEtapesByDemarcheId } from './demarches.queries.js'
import { getTitreByIdOrSlug } from './titres.queries.js'
import { etapeIdValidator } from 'camino-common/src/etape.js'
import { getEtapeById } from './etapes.queries.js'
import { FeatureCollectionPoints, FeatureMultiPolygon, GeojsonInformations, MultiPolygon, PerimetreAlertes, featureCollectionValidator, featureMultiPolygonValidator, geojsonImportBodyValidator } from 'camino-common/src/perimetre.js'
import { join } from 'node:path'
import { createReadStream } from 'node:fs'
import shpjs from 'shpjs'
import { Polygon } from 'geojson'
import { Stream } from 'node:stream'

export const getGeojsonByGeoSystemeId = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<FeatureMultiPolygon>) => {
  const geoSystemeIdParsed = transformableGeoSystemeIdValidator.safeParse(req.params.geoSystemeId)
  const geojsonParsed = featureMultiPolygonValidator.safeParse(req.body)

  if (!geoSystemeIdParsed.success || !geojsonParsed.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      res.json(await getGeojsonByGeoSystemeIdQuery(pool, GEO_SYSTEME_IDS.WGS84,  geoSystemeIdParsed.data, geojsonParsed.data))
    } catch (e) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      console.error(e)
    }
  }
}


// /rest/perimetre/:demarcheId/:etapeTypeId/alertes
//FIXME à appeler lors de la création d’une nouvelle étape non fondamentale, 
export const getPerimetreAlertes = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<PerimetreAlertes>) => {
  const user = req.auth

  if (!user) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  }else{
  const demarcheIdParsed = demarcheIdValidator.safeParse(req.params.demarcheId)
  const etapeTypeIdParsed = etapeTypeIdValidator.safeParse(req.params.etapeTypeId)

  if (!demarcheIdParsed.success || !etapeTypeIdParsed.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {

      //FIXME canRead demarche


    //FIXME charger le perimètre du titre si l’étape type n’est pas fondamentale
    
    const demarche = await getDemarcheByIdOrSlug(pool, demarcheIdParsed.data)

    const titre = await getTitreByIdOrSlug(pool, demarche.titre_id)

    res.json(await getAlertesByDemarcheId(pool, user, titre.titre_type_id, demarcheIdParsed.data))


    } catch (e) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      console.error(e)
    }
  }
}
}

const getAlertesByDemarcheId = async (pool: Pool, user: User, titreTypeId: TitreTypeId, demarcheId: DemarcheId): Promise<PerimetreAlertes> => {
  const etapes = await getEtapesByDemarcheId(pool, demarcheId)

    const mostRecentEtapeFondamentale = getMostRecentEtapeFondamentaleValide([{ordre: 1, etapes}])

    if( mostRecentEtapeFondamentale === null){
      return {superposition_alertes: [], sdomZoneIds: []}
    }else{
      return {superposition_alertes: await getAlertesSuperposition(mostRecentEtapeFondamentale.geojson4326_perimetre, mostRecentEtapeFondamentale.etape_type_id, titreTypeId, user, pool), sdomZoneIds: mostRecentEtapeFondamentale.sdom_zones ?? [] }
    }

}

// /rest/perimetre/:etapeId
export const getPerimetreInfos = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<PerimetreAlertes>) => {

  //on charge l’étape pour récupérer son périmètre et ses zones du sdom

  const user = req.auth

  if (!user) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  }else{
  const etapeIdParsed = etapeIdValidator.safeParse(req.params.etapeId)

  if (!etapeIdParsed.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {

      //FIXME canRead etape

    const etape = await getEtapeById(pool, etapeIdParsed.data)
    const demarche = await getDemarcheByIdOrSlug(pool, etape.demarche_id)
    const titre = await getTitreByIdOrSlug(pool, demarche.titre_id)
    
    if( isEtapeTypeIdFondamentale(etape.etape_type_id)){
      res.json({superposition_alertes: await getAlertesSuperposition(etape.geojson4326_perimetre, etape.etape_type_id, titre.titre_type_id, user, pool), sdomZoneIds: etape.sdom_zones ?? [] })
    }else{
      res.json(await getAlertesByDemarcheId(pool, user, titre.titre_type_id, etape.demarche_id))
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


export const geojsonImport = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<GeojsonInformations | Error>) => {
  const user = req.auth

  const geoSystemeId = transformableGeoSystemeIdValidator.safeParse(req.params.geoSystemeId)
  // FIXME qui a le droit d'appeler cette route ?
  if (!user) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!geoSystemeId.success) {
    console.warn(`le geoSystemeId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  }  else {
    const geojsonImportInput = geojsonImportBodyValidator.safeParse(req.body)

    if (geojsonImportInput.success) {
      try {
        
        const filename = geojsonImportInput.data.tempDocumentName
        if (!filename.endsWith('.geojson') && !filename.endsWith('.shp')) {
          throw new Error('seul les fichiers geojson ou shape sont acceptés')
        }

        const pathFrom = join(process.cwd(), `/files/tmp/${filename}`)
        const fileStream = createReadStream(pathFrom)

        const buffer = await stream2buffer(fileStream)

        let coordinates: [number, number][][][]
        let featureCollectionPoints: null | FeatureCollectionPoints = null
        if (filename.endsWith('.geojson')) {
          const features = featureCollectionValidator.parse(JSON.parse(buffer.toString()))
          
          coordinates = (await getGeojsonByGeoSystemeIdQuery(pool,geoSystemeId.data ,  GEO_SYSTEME_IDS.WGS84, features.features[0])).geometry.coordinates
          // TODO 2024-01-24 on importe les points que si le référentiel est en 4326
          if (geoSystemeId.data === '4326' && features.features.length > 1) {
            const [_multi, ...points] = features.features
            featureCollectionPoints = {type: 'FeatureCollection', features: points}
          }
        } else {
          // @ts-ignore FIXME
          coordinates = (shpjs.parseShp(buffer, 'EPSG:4326') as Polygon[]).map(p => p.coordinates)
        }

        const geojson: MultiPolygon = {type: 'MultiPolygon', coordinates}
              
        const geoInfo = await getGeojsonInformation(pool, geojson)
        const result: GeojsonInformations = {
          superposition_alertes: await getAlertesSuperposition(geojson,geojsonImportInput.data.etapeTypeId, geojsonImportInput.data.titreTypeId, user, pool),
          communes: geoInfo.communes,
          foretIds: geoInfo.forets,
          sdomZoneIds: geoInfo.sdom,
          secteurMaritimeIds: geoInfo.secteurs,
          surface: geoInfo.surface,
          geojson4326_perimetre: {type: 'Feature', geometry: geojson, properties: {}},
          geojson4326_points: featureCollectionPoints
        }
        
        res.json(result)
      } catch (e: any) {
        console.error(e)
        res.status(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
        res.json(e)
      }
    } else {
      res.status(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
      res.json(geojsonImportInput.error)
    }
  }
}




const getAlertesSuperposition = async (
  geojson4326_perimetre: MultiPolygon | null,
  etapeTypeId: EtapeTypeId,
  titreTypeId: TitreTypeId, 
  user: User,
  pool: Pool) => {
   if (titreTypeId === 'axm' && ['mfr', 'mcr'].includes(etapeTypeId) && (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && geojson4326_perimetre !== null) {

      // vérifie qu’il n’existe pas de demandes de titres en cours sur ce périmètre
      return getTitresIntersectionWithGeojson(pool, geojson4326_perimetre)

  }

  return []
}