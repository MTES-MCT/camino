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
