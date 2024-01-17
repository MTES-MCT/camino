import { ITitrePoint, Context } from '../../../types.js'

import { FileUpload } from 'graphql-upload'
import { Stream } from 'stream'
import shpjs from 'shpjs'
import { FeatureCollection, MultiPolygon, Polygon, Position, Feature } from 'geojson'
import { titreEtapeSdomZonesGet } from './_titre-etape.js'
import { geojsonFeatureMultiPolygon, geojsonSurface } from '../../../tools/geojson.js'
import { titreEtapeGet } from '../../../database/queries/titres-etapes.js'
import { titresGet } from '../../../database/queries/titres.js'
import { userSuper } from '../../../database/user-super.js'
import intersect from '@turf/intersect'
import { assertGeoSystemeId, GeoSystemes } from 'camino-common/src/static/geoSystemes.js'
import { isSuper, isAdministrationAdmin, isAdministrationEditeur, User } from 'camino-common/src/roles.js'
import { titreDemarcheGet } from '../../../database/queries/titres-demarches.js'
import { TitresStatutIds, TitresStatuts } from 'camino-common/src/static/titresStatuts.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { SDOMZone, SDOMZoneId, SDOMZoneIds, SDOMZones } from 'camino-common/src/static/sdom.js'
import { EtapeId } from 'camino-common/src/etape.js'
import { documentTypeIdsBySdomZonesGet } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sdom.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes.js'
import { TitreId } from 'camino-common/src/titres.js'

const stream2buffer = async (stream: Stream): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = [] as any[]

    stream.on('data', chunk => _buf.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(_buf)))
    stream.on('error', err => reject(new Error(`error converting stream - ${err}`)))
  })
}

interface IPerimetreAlerte {
  message: string
  url?: string
}

interface IPerimetreInformations {
  surface: number
  documentTypeIds: string[]
  alertes: IPerimetreAlerte[]
  sdomZones: SDOMZone[]
  //FIXME ajouter communes, forêts, facade maritime
}

export const pointsImporter = async (
  {
    fileUpload,
    geoSystemeId,
    demarcheId,
    etapeTypeId,
  }: {
    fileUpload: { file: FileUpload }
    geoSystemeId: string
    demarcheId: DemarcheId
    etapeTypeId: EtapeTypeId
  },
  context: Context
): Promise<
  IPerimetreInformations & {
    points: Omit<ITitrePoint, 'id' | 'titreEtapeId'>[]
  }
> => {
  try {
    const file = fileUpload.file

    if (!file) {
      throw new Error('fichier vide')
    }

    if (!file.filename.endsWith('.geojson') && !file.filename.endsWith('.shp')) {
      throw new Error('seul les fichiers geojson ou shape sont acceptés')
    }

    assertGeoSystemeId(geoSystemeId)

    const geoSysteme = GeoSystemes[geoSystemeId]

    const { createReadStream } = await file
    const buffer = await stream2buffer(createReadStream())

    let geojson: Position[][][]
    if (file.filename.endsWith('.geojson')) {
      const features = JSON.parse(buffer.toString()) as FeatureCollection<MultiPolygon>
      geojson = (features.features[0].geometry as MultiPolygon).coordinates
    } else {
      geojson = ((await shpjs.parseShp(buffer, 'EPSG:4326')) as Polygon[]).map(p => p.coordinates)
    }



    // FIXME passer le géojson
    return await sdomZonesInformationsGet(
      {
        geojson4326_perimetre: geojson,
        etapeTypeId,
      },
      context
    )
  } catch (e) {
    console.error(e)

    throw e
  }
}

const sdomZonesInformationsGet = async (
  geojson4326_perimetre: any,
  etapeTypeId: EtapeTypeId,
  user: User
): Promise<IPerimetreInformations> => {
  const etapeType = EtapesTypes[etapeTypeId]
  // si c’est une étape fondamentale on récupère les informations directement sur l’étape
  const points = etapeType.fondamentale ? etapePoints : titrePoints
  const zones = etapeType.fondamentale ? etape.sdomZones : titreSdomZones

  const alertes: IPerimetreAlerte[] = []

  // si c’est une demande d’AXM, on doit afficher une alerte si on est en zone 0 ou 1 du Sdom
  if (titreTypeId === 'axm' && ['mfr', 'mcr'].includes(etapeTypeId)) {
    const zoneId = zones.find(id => [SDOMZoneIds.Zone0, SDOMZoneIds.Zone0Potentielle, SDOMZoneIds.Zone1].includes(id))
    if (zoneId) {
      alertes.push({
        message: `Le périmètre renseigné est dans une zone du Sdom interdite à l’exploitation minière : ${SDOMZones[zoneId].nom}`,
      })
    }

    if ((isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && points?.length > 2) {
      // vérifie qu’il n’existe pas de demandes de titres en cours sur ce périmètre
      const titres = await titresGet(
        { statutsIds: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Valide, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire], domainesIds: ['m'] },
        { fields: { points: { id: {} } } },
        userSuper
      )
      const geojsonFeatures = geojsonFeatureMultiPolygon(points)

      // TODO 2022-08-30 utiliser postgis au lieu de turf/intersect
      titres
        ?.filter(t => t.id !== titreId)
        ?.filter(t => t.points && t.points.length > 2)
        .filter(t => !!intersect(geojsonFeatures, geojsonFeatureMultiPolygon(t.points ?? [])))
        .forEach(t =>
          alertes.push({
            message: `Le titre ${t.nom} au statut « ${isNotNullNorUndefined(t.titreStatutId) ? TitresStatuts[t.titreStatutId].nom : ''} » est superposé à ce titre`,
            url: `/titres/${t.slug}`,
          })
        )
    }
  }

  if (!points || points.length < 3) {
    return { surface: 0, documentTypeIds: [], alertes }
  }
  const geojsonFeatures = geojsonFeatureMultiPolygon(points as ITitrePoint[])

  const surface = await geojsonSurface(geojsonFeatures as Feature)

  const documentTypeIds = documentTypeIdsBySdomZonesGet(etapeSdomZones, titreTypeId, demarcheTypeId, etapeTypeId)

  return { surface, documentTypeIds, alertes }
}

export const getSDOMZoneByPoints = async (demarcheId: DemarcheId, points: ITitrePoint[] | null | undefined): Promise<{ sdomZones: SDOMZoneId[]; titreEtapePoints: ITitrePoint[] }> => {
  const sdomZones: SDOMZoneId[] = []
  let titreEtapePoints: ITitrePoint[] = []
  if (points && points.length > 2) {

    //FIXME 
    const geojsonFeatures: Feature<any> ={type: 'Feature', geometry: null, properties: {}}

    const result = await titreEtapeSdomZonesGet(geojsonFeatures)
    if (result.fallback) {
      console.warn(`utilisation du fallback pour la démarche ${demarcheId}`)
    }
    sdomZones.push(...result.data)
  }

  return { sdomZones, titreEtapePoints }
}

export const perimetreInformations = async (
  {
    demarcheId,
    etapeTypeId,
  }: {
    demarcheId: DemarcheId
    etapeTypeId: EtapeTypeId
  },
  { user }: Context
): Promise<IPerimetreInformations & { points: ITitrePoint[] }> => {
  try {
    if (!user) {
      throw new Error('droits insuffisants')
    }

    const demarche = await titreDemarcheGet(demarcheId, { fields: { id: {} } }, userSuper)

    if (!demarche) {
      throw new Error('droits insuffisants')
    }

    //FIXME charger le perimètre du titre si l’étape type n’est pas fondamentale

    return sdomZonesInformationsGet(null, etapeTypeId, demarche.titreId, user)


  } catch (e) {
    console.error(e)

    throw e
  }
}

export const titreEtapePerimetreInformations = async (
  {
    titreEtapeId,
  }: {
    titreEtapeId: EtapeId
  },
  { user }: Context
): Promise<IPerimetreInformations> => {
  try {
    if (!user) {
      throw new Error('droits insuffisants')
    }

    const etape = await titreEtapeGet(
      titreEtapeId,
      {
        fields: { id: {} },
      },
      user
    )

    if (!etape) {
      throw new Error('droits insuffisants')
    }


    //FIXME charger le perimètre de l’étape si elle est fondamentale sinon périmètre du titre

    return sdomZonesInformationsGet(
      etape.id,
      etape.typeId,
      null,
      user
    )
  } catch (e) {
    console.error(e)

    throw e
  }
}
