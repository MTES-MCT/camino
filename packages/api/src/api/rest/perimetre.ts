import { FeatureMultiPolygon, MultiPolygon, demarcheIdValidator, featureMultiPolygonValidator } from 'camino-common/src/demarche.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { Pool } from 'pg'
import { transformableGeoSystemeIdValidator } from 'camino-common/src/static/geoSystemes.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { getGeojsonByGeoSystemeId as getGeojsonByGeoSystemeIdQuery, getTitresIntersectionWithGeojson } from './perimetre.queries.js'
import { EtapeTypeId, etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes.js'
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

    const etapes = await getEtapesByDemarcheId(pool, demarcheIdParsed.data)

    const mostRecentEtapeFondamentale = getMostRecentEtapeFondamentaleValide([{ordre: 1, etapes}])

    if( mostRecentEtapeFondamentale === null){
      res.json({alertes: [], sdomZoneIds: []})
    }else{
      res.json({alertes: await getAlertesSuperposition(mostRecentEtapeFondamentale.geojson4326_perimetre, mostRecentEtapeFondamentale.etape_type_id, titre.titre_type_id, user, pool), sdomZoneIds: mostRecentEtapeFondamentale.sdom_zones ?? [] })
    }


    } catch (e) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      console.error(e)
    }
  }
}
}

// /rest/perimetre/:etapeId
export const getPerimetreInfos = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<PerimetreAlertes>) => {

  //on charge l’étape pour récupérer son périmètre et ses zones du sdom



}


// /rest/geojson/import
export const geojsonImport = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<PerimetreInformation>) => {

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