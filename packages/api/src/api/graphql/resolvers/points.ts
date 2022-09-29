import { ISDOMZone, ITitrePoint, IToken, IUtilisateur } from '../../../types'

import { FileUpload } from 'graphql-upload'
import { Stream } from 'stream'
import shpjs from 'shpjs'
import { FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'
import {
  documentTypeIdsBySdomZonesGet,
  titreEtapePointsCalc,
  titreEtapeSdomZonesGet
} from './_titre-etape'
import {
  geojsonFeatureMultiPolygon,
  geojsonSurface
} from '../../../tools/geojson'
import { Feature } from '@turf/helpers'
import { titreEtapeGet } from '../../../database/queries/titres-etapes'
import { userGet } from '../../../database/queries/utilisateurs'
import { etapeTypeGet } from '../../../database/queries/metas'
import { titreGet, titresGet } from '../../../database/queries/titres'
import { userSuper } from '../../../database/user-super'
import intersect from '@turf/intersect'
import {
  assertGeoSystemeId,
  GeoSystemes
} from 'camino-common/src/static/geoSystemes'
import {
  isSuper,
  isAdministrationAdmin,
  isAdministrationEditeur
} from 'camino-common/src/roles'
import { titreDemarcheGet } from '../../../database/queries/titres-demarches'
import { TitresStatuts } from 'camino-common/src/static/titresStatuts'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { SDOMZoneId, SDOMZoneIds } from 'camino-common/src/static/sdom'

const stream2buffer = async (stream: Stream): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = [] as any[]

    stream.on('data', chunk => _buf.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(_buf)))
    stream.on('error', err =>
      reject(new Error(`error converting stream - ${err}`))
    )
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
  sdomZones: ISDOMZone[]
}

export const pointsImporter = async (
  {
    fileUpload,
    geoSystemeId,
    demarcheId,
    etapeTypeId
  }: {
    fileUpload: { file: FileUpload }
    geoSystemeId: string
    demarcheId: string
    etapeTypeId: string
  },
  context: IToken
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

    if (
      !file.filename.endsWith('.geojson') &&
      !file.filename.endsWith('.shp')
    ) {
      throw new Error('seul les fichiers geojson ou shape sont acceptés')
    }

    assertGeoSystemeId(geoSystemeId)

    const geoSysteme = GeoSystemes[geoSystemeId]

    const { createReadStream } = await file
    const buffer = await stream2buffer(createReadStream())

    let geojson: Position[][][]
    if (file.filename.endsWith('.geojson')) {
      const features = JSON.parse(
        buffer.toString()
      ) as FeatureCollection<MultiPolygon>
      geojson = (features.features[0].geometry as MultiPolygon).coordinates
    } else {
      geojson = ((await shpjs.parseShp(buffer, 'EPSG:4326')) as Polygon[]).map(
        p => p.coordinates
      )
    }

    const points = [] as Omit<ITitrePoint, 'id' | 'titreEtapeId'>[]

    geojson.forEach((groupe, groupeIndex) => {
      groupe.forEach((contour, contourIndex) => {
        contour.forEach((point, pointIndex) => {
          // Si le point n’a pas déjà été ajouté. Souvent le dernier point est le même que le premier.
          if (
            !points.some(
              p =>
                p.references[0].coordonnees.x === point[0] &&
                p.references[0].coordonnees.y === point[1]
            )
          ) {
            points.push({
              groupe: groupeIndex + 1,
              contour: contourIndex + 1,
              point: pointIndex + 1,
              coordonnees: { x: 0, y: 0 },
              references: [
                {
                  id: '',
                  titrePointId: '',
                  coordonnees: { x: point[0], y: point[1] },
                  geoSystemeId: geoSysteme.id
                }
              ]
            })
          }
        })
      })
    })

    return await perimetreInformations(
      {
        points: points as ITitrePoint[],
        demarcheId,
        etapeTypeId
      },
      context
    )
  } catch (e) {
    console.error(e)

    throw e
  }
}

const sdomZonesInformationsGet = async (
  etapePoints: ITitrePoint[],
  etapeSdomZones: ISDOMZone[],
  titreTypeId: string,
  demarcheTypeId: string,
  etapeTypeId: string,
  titrePoints: ITitrePoint[],
  titreSdomZones: ISDOMZone[],
  titreId: string,
  user: IUtilisateur
) => {
  const etapeType = await etapeTypeGet(etapeTypeId, { fields: { id: {} } })
  // si c’est une étape fondamentale on récupère les informations directement sur l’étape
  const points = etapeType!.fondamentale ? etapePoints : titrePoints
  const zones = etapeType!.fondamentale ? etapeSdomZones : titreSdomZones

  const alertes = [] as IPerimetreAlerte[]

  // si c’est une demande d’AXM, on doit afficher un alerte si on est en zone 0 ou 1 du Sdom
  if (titreTypeId === 'axm' && ['mfr', 'mcr'].includes(etapeTypeId)) {
    const zone = zones.find(s =>
      [
        SDOMZoneIds.Zone0,
        SDOMZoneIds.Zone0Potentielle,
        SDOMZoneIds.Zone1
      ].includes(s.id as SDOMZoneId)
    )
    if (zone) {
      alertes.push({
        message: `Le périmètre renseigné est dans une zone du Sdom interdite à l’exploitation minière : ${zone.nom}`
      })
    }

    if (
      (isSuper(user) ||
        isAdministrationAdmin(user) ||
        isAdministrationEditeur(user)) &&
      points?.length > 2
    ) {
      // vérifie qu’il n’existe pas de demandes de titres en cours sur ce périmètre
      const titres = await titresGet(
        { statutsIds: ['val', 'mod', 'dmi'], domainesIds: ['m'] },
        { fields: { points: { id: {} } } },
        userSuper
      )
      const geojsonFeatures = geojsonFeatureMultiPolygon(
        points as ITitrePoint[]
      )

      // TODO 2022-08-30 utiliser postgis au lieu de turf/intersect
      titres
        ?.filter(t => t.id !== titreId)
        ?.filter(t => t.points && t.points.length > 2)
        .filter(
          t =>
            !!intersect(
              geojsonFeatures as Feature<Polygon>,
              geojsonFeatureMultiPolygon(
                t.points as ITitrePoint[]
              ) as Feature<Polygon>
            )
        )
        .forEach(t =>
          alertes.push({
            message: `Le titre ${t.nom} au statut « ${
              isNotNullNorUndefined(t.titreStatutId)
                ? TitresStatuts[t.titreStatutId].nom
                : ''
            } » est superposé à ce titre`,
            url: `/titres/${t.slug}`
          })
        )
    }
  }

  if (!points || points.length < 3) {
    return { surface: 0, documentTypeIds: [], alertes }
  }
  const geojsonFeatures = geojsonFeatureMultiPolygon(points as ITitrePoint[])

  const surface = await geojsonSurface(geojsonFeatures as Feature)

  const documentTypeIds = documentTypeIdsBySdomZonesGet(
    etapeSdomZones,
    titreTypeId,
    demarcheTypeId,
    etapeTypeId
  )

  return { surface, documentTypeIds, alertes }
}

export const perimetreInformations = async (
  {
    points,
    demarcheId,
    etapeTypeId
  }: {
    points: ITitrePoint[] | undefined | null
    demarcheId: string
    etapeTypeId: string
  },
  context: IToken
): Promise<IPerimetreInformations & { points: ITitrePoint[] }> => {
  try {
    const user = await userGet(context.user?.id)

    if (!user) {
      throw new Error('droits insuffisants')
    }

    const sdomZones = [] as ISDOMZone[]
    let titreEtapePoints = [] as ITitrePoint[]
    if (points && points.length > 2) {
      titreEtapePoints = titreEtapePointsCalc(points)

      const geojsonFeatures = geojsonFeatureMultiPolygon(
        titreEtapePoints as ITitrePoint[]
      ) as Feature

      const result = await titreEtapeSdomZonesGet(geojsonFeatures)
      if (result.fallback) {
        console.warn(`utilisation du fallback pour la démarche ${demarcheId}`)
      }
      sdomZones.push(...result.data)
    }

    const demarche = await titreDemarcheGet(
      demarcheId,
      { fields: { id: {} } },
      userSuper
    )

    if (!demarche) {
      throw new Error('droits insuffisants')
    }

    const titre = await titreGet(
      demarche.titreId,
      {
        fields: { sdomZones: { id: {} }, points: { id: {} } }
      },
      userSuper
    )

    const informations = await sdomZonesInformationsGet(
      titreEtapePoints,
      sdomZones,
      titre!.typeId,
      demarche.typeId,
      etapeTypeId,
      titre!.points || [],
      titre!.sdomZones || [],
      titre!.id,
      user
    )

    return { ...informations, sdomZones, points: titreEtapePoints }
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const titreEtapePerimetreInformations = async (
  {
    titreEtapeId
  }: {
    titreEtapeId: string
  },
  context: IToken
): Promise<IPerimetreInformations> => {
  try {
    const user = await userGet(context.user?.id)

    if (!user) {
      throw new Error('droits insuffisants')
    }

    const etape = await titreEtapeGet(
      titreEtapeId,
      {
        fields: {
          sdomZones: { id: {} },
          demarche: { titre: { sdomZones: { id: {} }, points: { id: {} } } }
        }
      },
      user
    )

    if (!etape) {
      throw new Error('droits insuffisants')
    }

    const sdomZones = etape.sdomZones || []

    const informations = await sdomZonesInformationsGet(
      etape.points || [],
      sdomZones,
      etape.demarche!.titre!.typeId,
      etape.demarche!.typeId,
      etape.typeId,
      etape.demarche!.titre!.points || [],
      etape.demarche!.titre!.sdomZones || [],
      etape.demarche!.titreId,
      user
    )

    return { sdomZones, ...informations }
  } catch (e) {
    console.error(e)

    throw e
  }
}
