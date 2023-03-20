import { cloneAndClean } from './index'
import { GeoSysteme, GeoSystemeId, GeoSystemes, isGeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { CaminoDocument, Etape } from 'camino-common/src/etape'
import { DocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { getKeys, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

interface Point {
  id: string
  references: PointReference[]
  contour: number
  groupe: number
  lot: number | null
  subsidiaire: boolean | null
  nom: string
  description: string
}

interface PointReference {
  opposable: boolean
  geoSystemeId: GeoSystemeId
  coordonnees: object
  id: string
}

export interface GroupeBuildPoint {
  id?: string
  nom?: string
  lot?: number | null
  subsidiaire?: boolean | null
  description?: string
  references: ({ id?: string } & object)[] | { [key in GeoSystemeId]?: { id?: string } & object }
  // used by points-edit ?
  groupe?: number
  contour?: number
  point?: number
}

interface GroupeBuild {
  groupes: GroupeBuildPoint[][][]
  geoSystemesIndex: { [key in GeoSystemeId]?: GeoSysteme }
  lotCurrent: null | number
  pointIndex: number | null
  contourIndexPrevious: number
  groupeIndexPrevious: number
}

const referencesBuild = (references: PointReference[]): { pointGeoSystemesIndex: { [key in GeoSystemeId]?: GeoSysteme }; pointReferences: { [key in GeoSystemeId]?: { id?: string } & object } } =>
  references.reduce<{ pointGeoSystemesIndex: { [key in GeoSystemeId]?: GeoSysteme }; pointReferences: { [key in GeoSystemeId]?: { id?: string } & object } }>(
    ({ pointGeoSystemesIndex, pointReferences }, { geoSystemeId, coordonnees, id }) => {
      pointGeoSystemesIndex[geoSystemeId] = GeoSystemes[geoSystemeId]

      pointReferences[geoSystemeId] = { ...coordonnees }

      if (id) {
        ;(pointReferences[geoSystemeId] ??= {}).id = id
      }

      return { pointGeoSystemesIndex, pointReferences }
    },
    { pointGeoSystemesIndex: {}, pointReferences: {} }
  )

const geoSystemeOpposableIdFind = (references: PointReference[]): GeoSystemeId | undefined => {
  const referenceOpposable = references.find(r => r.opposable)

  return referenceOpposable ? referenceOpposable.geoSystemeId : undefined
}

const groupeBuild = (points: Point[], geoSystemeOpposableId: GeoSystemeId | undefined) =>
  points.reduce<GroupeBuild>(
    ({ groupes, geoSystemesIndex, lotCurrent, pointIndex, contourIndexPrevious, groupeIndexPrevious }, { nom, description, contour, groupe, references, lot, subsidiaire, id }) => {
      const { pointReferences, pointGeoSystemesIndex } = referencesBuild(references)

      const lotGeoSystemeId: GeoSystemeId = geoSystemeOpposableId || getKeys(pointGeoSystemesIndex, isGeoSystemeId)[0]

      const values = pointReferences[lotGeoSystemeId]
      if (lot && lotCurrent && lotCurrent === lot && groupe === groupeIndexPrevious && contour === contourIndexPrevious && pointIndex && values) {
        const ref = groupes[groupe - 1][contour - 1][pointIndex - 1].references
        if (Array.isArray(ref)) {
          ref.push(values)
        }
      } else {
        if (!groupes[groupe - 1]) {
          groupes[groupe - 1] = []
        }

        if (!groupes[groupe - 1][contour - 1]) {
          groupes[groupe - 1][contour - 1] = []
        }

        const point: GroupeBuildPoint = {
          description,
          lot,
          subsidiaire,
          references: lot && values ? [values] : pointReferences,
        }

        if (id) {
          point.id = id
        }

        if (!lot) {
          point.nom = nom
        }

        groupes[groupe - 1][contour - 1].push(point)

        pointIndex = lot ? groupes[groupe - 1][contour - 1].length : null
        lotCurrent = lot
        contourIndexPrevious = contour
        groupeIndexPrevious = groupe
      }

      return {
        groupes,
        geoSystemesIndex: Object.assign(geoSystemesIndex, pointGeoSystemesIndex),
        lotCurrent,
        pointIndex,
        contourIndexPrevious,
        groupeIndexPrevious,
      }
    },
    {
      groupes: [],
      geoSystemesIndex: {},
      lotCurrent: null,
      pointIndex: 0,
      contourIndexPrevious: 1,
      groupeIndexPrevious: 1,
    }
  )

export const etapeGroupesBuild = (points: Point[]): { groupes: GroupeBuildPoint[][][]; geoSystemes: (GeoSysteme | undefined)[]; geoSystemeOpposableId: GeoSystemeId | undefined } => {
  const geoSystemeOpposableId = geoSystemeOpposableIdFind(points[0].references)

  const { groupes, geoSystemesIndex } = groupeBuild(points, geoSystemeOpposableId)

  return {
    groupes,
    geoSystemes: getKeys(geoSystemesIndex, isGeoSystemeId).map(id => geoSystemesIndex[id]),
    geoSystemeOpposableId,
  }
}

interface EtapePointEnhanced {
  groupes: GroupeBuildPoint[][][]
  geoSystemeIds: GeoSystemeId[]
  geoSystemeOpposableId: unknown | null
}

export const etapePointsFormat = (points: Point[] | null): EtapePointEnhanced => {
  if (points && points.length) {
    const { groupes, geoSystemes, geoSystemeOpposableId } = etapeGroupesBuild(points)
    return { groupes, geoSystemeIds: geoSystemes.filter(isNotNullNorUndefined).map(({ id }) => id), geoSystemeOpposableId }
  } else {
    return { groupes: [], geoSystemeIds: [], geoSystemeOpposableId: null }
  }
}

type CaminoDocumentEdit = CaminoDocument & {
  typeId: DocumentTypeId
  fichierNouveau: null
}

export type EtapeEdit = Omit<Etape, 'administrations' | 'documents' | 'communes' | 'points'> & { documents: CaminoDocument[] } & EtapePointEnhanced
export const etapeEditFormat = (etape: Etape): EtapeEdit => {
  const newEtape: Etape = cloneAndClean(etape)

  delete newEtape.administrations
  delete newEtape.communes
  delete newEtape.geojsonPoints
  delete newEtape.geojsonMultiPolygon
  const entreprisesPropIds = ['titulaires', 'amodiataires'] as const

  entreprisesPropIds.forEach(propId => {
    if (newEtape[propId]) {
      newEtape[propId] = newEtape[propId].map(({ id, operateur }) => ({
        id,
        operateur,
      }))
    } else {
      newEtape[propId] = []
    }
  })

  if (!newEtape.substances) {
    newEtape.substances = []
  }

  const newEtapePointEnhanced: EtapeEdit = newEtape as unknown as EtapeEdit
  const { groupes, geoSystemeIds, geoSystemeOpposableId } = etapePointsFormat(newEtape.points)
  newEtapePointEnhanced.groupes = groupes
  newEtapePointEnhanced.geoSystemeIds = geoSystemeIds
  newEtapePointEnhanced.geoSystemeOpposableId = geoSystemeOpposableId

  if (!newEtapePointEnhanced.incertitudes) {
    newEtapePointEnhanced.incertitudes = {
      amodiataires: false,
      date: false,
      dateDebut: false,
      dateFin: false,
      duree: false,
      points: false,
      substances: false,
      surface: false,
      titulaires: false,
    }
  }

  if (!newEtapePointEnhanced.contenu) {
    newEtapePointEnhanced.contenu = {}
  }

  if (!newEtapePointEnhanced.documents) {
    newEtapePointEnhanced.documents = []
  } else {
    newEtapePointEnhanced.documents = newEtapePointEnhanced.documents.map(documentEtapeFormat)
  }

  if (!newEtapePointEnhanced.justificatifs) {
    newEtapePointEnhanced.justificatifs = []
  }

  // @ts-ignore
  delete newEtapePointEnhanced.points

  // @ts-ignore
  return newEtapePointEnhanced
}

export const documentEtapeFormat = (document: CaminoDocument): CaminoDocumentEdit => {
  return { ...document, typeId: document.type.id, fichierNouveau: null }
}
