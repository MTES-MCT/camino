import { DemarcheId, FeatureMultiPolygon, MultiPolygon, demarcheIdValidator, featureMultiPolygonValidator } from 'camino-common/src/demarche.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { Pool } from 'pg'
import { GeoSystemes, transformableGeoSystemeIdValidator } from 'camino-common/src/static/geoSystemes.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { getGeojsonByGeoSystemeId as getGeojsonByGeoSystemeIdQuery, getTitresIntersectionWithGeojson } from './perimetre.queries.js'
import { EtapeTypeId, etapeTypeIdValidator, isEtapeTypeIdFondamentale } from 'camino-common/src/static/etapesTypes.js'
import {z} from 'zod'
import { sdomZoneIdValidator } from 'camino-common/src/static/sdom.js'
import { foretIdValidator } from 'camino-common/src/static/forets.js'
import { communeIdValidator } from 'camino-common/src/static/communes.js'
import { secteurMaritimeValidator } from 'camino-common/src/static/facades.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getMostRecentEtapeFondamentaleValide, titreSlugValidator } from 'camino-common/src/titres.js'
import { titreStatutIdValidator } from 'camino-common/src/static/titresStatuts.js'
import { isAdministrationAdmin, isAdministrationEditeur, isSuper, User } from 'camino-common/src/roles.js'
import { getDemarcheByIdOrSlug, getEtapesByDemarcheId } from './demarches.queries.js'
import { getTitreByIdOrSlug } from './titres.queries.js'
import { etapeIdValidator } from 'camino-common/src/etape.js'
import { getEtapeById } from './etapes.queries.js'

export const getGeojsonByGeoSystemeId = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<FeatureMultiPolygon>) => {
  const geoSystemeIdParsed = transformableGeoSystemeIdValidator.safeParse(req.params.geoSystemeId)
  const geojsonParsed = featureMultiPolygonValidator.safeParse(req.body)

  if (!geoSystemeIdParsed.success || !geojsonParsed.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      res.json(await getGeojsonByGeoSystemeIdQuery(pool, geoSystemeIdParsed.data, geojsonParsed.data))
    } catch (e) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      console.error(e)
    }
  }
}

type PerimetreAlertes = Pick<PerimetreInformation, 'alertes' | 'sdomZoneIds'>

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


    //FIXME charger le perimètre du titre si l’étape type n’est pas fondamentale
    
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

const getAlertesByDemarcheId = async (pool: Pool, user: User, titreTypeId: TitreTypeId, demarcheId: DemarcheId) => {
  const etapes = await getEtapesByDemarcheId(pool, demarcheId)

    const mostRecentEtapeFondamentale = getMostRecentEtapeFondamentaleValide([{ordre: 1, etapes}])

    if( mostRecentEtapeFondamentale === null){
      return {alertes: [], sdomZoneIds: []}
    }else{
      return {alertes: await getAlertesSuperposition(mostRecentEtapeFondamentale.geojson4326_perimetre, mostRecentEtapeFondamentale.etape_type_id, titreTypeId, user, pool), sdomZoneIds: mostRecentEtapeFondamentale.sdom_zones ?? [] }
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
      res.json({alertes: await getAlertesSuperposition(etape.geojson4326_perimetre, etape.etape_type_id, titre.titre_type_id, user, pool), sdomZoneIds: etape.sdom_zones ?? [] })
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


// /rest/geojson/import/:geosystemeId
export const geojsonImport = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<PerimetreInformation>) => {


  // const user = req.auth

  // if (!user) {
  //   res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  // }else{

    // const file = fileUpload.file

    // if (!file) {
    //   throw new Error('fichier vide')
    // }

    // if (!file.filename.endsWith('.geojson') && !file.filename.endsWith('.shp')) {
    //   throw new Error('seul les fichiers geojson ou shape sont acceptés')
    // }


    req.on('data', (data: any) => {
      console.log(data);
    });
  //   console.log('req', req)
  //   const file = JSON.parse(JSON.stringify(req.files))
  //   console.log('file', file)

  // var file_name = file.file.name
  // console.log('file_name', file_name)

  //if you want just the buffer format you can use it
  // var buffer = new Buffer.from(file.file.data.data)


    // const geoSysteme = GeoSystemes[geoSystemeId]

    // const { createReadStream } = await file
    // const buffer = await stream2buffer(createReadStream())

    // let geojson: Position[][][]
    // if (file.filename.endsWith('.geojson')) {
    //   const features = JSON.parse(buffer.toString()) as FeatureCollection<MultiPolygon>
    //   geojson = (features.features[0].geometry as MultiPolygon).coordinates
    // } else {
    //   geojson = ((await shpjs.parseShp(buffer, 'EPSG:4326')) as Polygon[]).map(p => p.coordinates)
    // }

    // } catch (e) {
    //   res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    //   console.error(e)
    // }
  // }
}

const superpositionAlerteValidator = z.object({slug: titreSlugValidator, nom: z.string(), titre_statut_id: titreStatutIdValidator})

const geojsonInformationsValidator = z.object({
  alertes: z.array(superpositionAlerteValidator),
  surface: z.number(),
  sdomZoneIds: z.array(sdomZoneIdValidator),
  foretIds: z.array(foretIdValidator),
  communes: z.array(z.object({id: communeIdValidator, nom: z.string()})),
  secteurMaritimeIds: z.array(secteurMaritimeValidator)
})


type PerimetreInformation = z.infer<typeof geojsonInformationsValidator>
const getGeojsonInformations = async (
  geojson4326_perimetre: any,
  etapeTypeId: EtapeTypeId,
  titreTypeId: TitreTypeId,
  user: User
): Promise<PerimetreInformation> => {

  
  const alertes: PerimetreALerte[] = []

 

  if (!points || points.length < 3) {
    return { surface: 0, alertes }
  }
  const geojsonFeatures = geojsonFeatureMultiPolygon(points as ITitrePoint[])

  const surface = await geojsonSurface(geojsonFeatures as Feature)

  //FIXME mettre les documentTypeIds dans le front

  return { surface }
}


const getAlertesSuperposition = async (
  geojson4326_perimetre: MultiPolygon | null,
  etapeTypeId: EtapeTypeId,
  titreTypeId: TitreTypeId, 
  user: User,
  pool: Pool) => {
   // si c’est une demande d’AXM, on doit afficher une alerte si on est en zone 0 ou 1 du Sdom
   if (titreTypeId === 'axm' && ['mfr', 'mcr'].includes(etapeTypeId) && (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && geojson4326_perimetre !== null) {

    // FIXME à mettre dans le front
    // const zoneId = zones.find(id => [SDOMZoneIds.Zone0, SDOMZoneIds.Zone0Potentielle, SDOMZoneIds.Zone1].includes(id))
    // if (zoneId) {
    //   alertes.push({sdomZoneId: zoneId})
    // }

      // vérifie qu’il n’existe pas de demandes de titres en cours sur ce périmètre
      return getTitresIntersectionWithGeojson(pool, geojson4326_perimetre)

  }

  return []
}