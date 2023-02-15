import {
  ICoordonnees,
  IEtapeType,
  IHeritageContenu,
  IHeritageProps,
  ISection,
  ITitreDemarche,
  ITitreEtape,
  ITitrePointReference
} from '../../../types.js'

import { geoConvert } from '../../../tools/geo-convert.js'

import {
  titreEtapeHeritagePropsFind,
  titreEtapePropsIds
} from '../../../business/utils/titre-etape-heritage-props-find.js'
import { titreEtapeHeritageContenuFind } from '../../../business/utils/titre-etape-heritage-contenu-find.js'
import { etapeTypeSectionsFormat } from '../../_format/etapes-types.js'
import {
  titreEtapesSortAscByOrdre,
  titreEtapesSortDescByOrdre
} from '../../../business/utils/titre-etapes-sort.js'
import { GeoSystemes } from 'camino-common/src/static/geoSystemes.js'
import { geojsonIntersectsSDOM, GeoJsonResult } from '../../../tools/geojson.js'
import { Feature } from 'geojson'
import { SDOMZoneIds, SDOMZoneId } from 'camino-common/src/static/sdom.js'
import {
  DocumentTypeId,
  DocumentType,
  DOCUMENTS_TYPES_IDS
} from 'camino-common/src/static/documentsTypes.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import {
  DEMARCHES_TYPES_IDS,
  DemarcheTypeId
} from 'camino-common/src/static/demarchesTypes.js'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes.js'
import { DOMAINES_IDS } from 'camino-common/src/static/domaines.js'
import {
  TitreTypeId,
  toTitreTypeId
} from 'camino-common/src/static/titresTypes.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import {
  getSections,
  Section
} from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'

export const titreEtapePointsCalc = <
  T extends {
    references: ITitrePointReference[]
    coordonnees: ICoordonnees
  }
>(
  titrePoints: T[]
) => {
  const uniteRatio = uniteRatioFind(pointReferenceFind(titrePoints))

  return titrePoints.map(point => {
    const reference =
      point.references.find(r => r.opposable) || point.references[0]

    point.coordonnees = geoConvert(reference.geoSystemeId, {
      x: reference.coordonnees.x * uniteRatio,
      y: reference.coordonnees.y * uniteRatio
    })

    return point
  })
}

const pointReferenceFind = (
  points: {
    references: ITitrePointReference[]
  }[]
) =>
  points.length &&
  points[0].references &&
  points[0].references.length &&
  (points[0].references.find(r => r.opposable) || points[0].references[0])

const uniteRatioFind = (pointReference: ITitrePointReference | 0) => {
  if (!pointReference || !pointReference.geoSystemeId) return 1

  const geoSysteme = GeoSystemes[pointReference.geoSystemeId]

  return geoSysteme.uniteId === 'gon' ? 0.9 : 1
}

const titreEtapeHeritagePropsBuild = (
  date: string,
  titreEtapes?: ITitreEtape[] | null
) => {
  const titreEtapesFiltered = titreEtapesSortAscByOrdre(
    titreEtapes?.filter(e => e.type?.fondamentale && e.date < date) ?? []
  )

  const heritageProps = titreEtapePropsIds.reduce((acc: IHeritageProps, id) => {
    acc[id] = { actif: !!titreEtapesFiltered.length }

    return acc
  }, {})

  const titreEtape = { date, heritageProps } as ITitreEtape

  titreEtapesFiltered.push(titreEtape)

  titreEtapesFiltered.forEach((te: ITitreEtape, index: number) => {
    const titreEtapePrecedente =
      index > 0 ? titreEtapesFiltered[index - 1] : null

    const { titreEtape } = titreEtapeHeritagePropsFind(te, titreEtapePrecedente)

    titreEtapesFiltered[index] = titreEtape
  })

  const newTitreEtape = titreEtapesFiltered[titreEtapesFiltered.length - 1]

  if (newTitreEtape.heritageProps) {
    Object.keys(newTitreEtape.heritageProps).forEach(id => {
      const etapeId =
        newTitreEtape.heritageProps && newTitreEtape.heritageProps[id].etapeId

      if (etapeId) {
        newTitreEtape.heritageProps![id].etape = titreEtapesFiltered.find(
          ({ id }) => id === etapeId
        )
      }
    })
  }

  return newTitreEtape
}

const titreEtapeHeritageContenuBuild = (
  date: string,
  etapeType: IEtapeType,
  sections: ISection[],
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  titreEtapes?: ITitreEtape[] | null
) => {
  if (!titreEtapes) {
    titreEtapes = []
  }
  const titreEtape = {
    id: 'new-titre-etape',
    date,
    type: etapeType,
    typeId: etapeType.id,
    sectionsSpecifiques: sections
  } as ITitreEtape

  let titreEtapesFiltered = titreEtapesSortDescByOrdre(
    titreEtapes.filter(te => te.date < date)
  )

  titreEtapesFiltered.splice(0, 0, titreEtape)

  const etapeSectionsDictionary = titreEtapesFiltered.reduce<{
    [etapeId: string]: DeepReadonly<Section>[]
  }>((acc, e) => {
    acc[e.id] = getSections(titreTypeId, demarcheTypeId, e.typeId)

    return acc
  }, {})

  titreEtape.heritageContenu = sections.reduce(
    (heritageContenu: IHeritageContenu, section) => {
      if (!section.elements?.length) return heritageContenu

      heritageContenu[section.id] = section.elements?.reduce(
        (acc: IHeritageProps, element) => {
          acc[element.id] = {
            actif: !!titreEtapesFiltered.find(
              e =>
                e.id !== titreEtape.id &&
                etapeSectionsDictionary[e.id] &&
                etapeSectionsDictionary[e.id].find(
                  s =>
                    s.id === section.id &&
                    s.elements?.find(el => el.id === element.id)
                )
            )
          }

          return acc
        },
        {}
      )

      return heritageContenu
    },
    {}
  )

  titreEtapesFiltered = titreEtapesFiltered.filter(
    e => etapeSectionsDictionary[e.id]
  )

  const { contenu, heritageContenu } = titreEtapeHeritageContenuFind(
    titreEtapesFiltered,
    titreEtape,
    etapeSectionsDictionary
  )

  if (heritageContenu) {
    Object.keys(heritageContenu).forEach(sectionId => {
      Object.keys(heritageContenu![sectionId]).forEach(elementId => {
        const etapeId =
          heritageContenu &&
          heritageContenu[sectionId] &&
          heritageContenu[sectionId][elementId].etapeId

        if (etapeId) {
          heritageContenu![sectionId][elementId].etape =
            titreEtapesFiltered.find(({ id }) => id === etapeId)
        }
      })
    })
  }

  return { contenu, heritageContenu }
}

export const titreEtapeHeritageBuild = (
  date: string,
  etapeType: IEtapeType,
  titreDemarche: ITitreDemarche,
  sectionsSpecifiques: ISection[],
  justificatifsTypesSpecifiques: DocumentType[],
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId
) => {
  let titreEtape = {} as ITitreEtape

  if (etapeType.fondamentale) {
    titreEtape = titreEtapeHeritagePropsBuild(date, titreDemarche.etapes)
  }

  titreEtape.modification = true

  const sections = etapeTypeSectionsFormat(
    etapeType.sections,
    sectionsSpecifiques
  )
  if (sections?.length) {
    const { contenu, heritageContenu } = titreEtapeHeritageContenuBuild(
      date,
      etapeType,
      sectionsSpecifiques,
      titreTypeId,
      demarcheTypeId,
      titreDemarche.etapes
    )

    titreEtape.contenu = contenu
    titreEtape.heritageContenu = heritageContenu
  }

  titreEtape.type = etapeType
  titreEtape.titreDemarcheId = titreDemarche.id
  titreEtape.sectionsSpecifiques = sectionsSpecifiques
  titreEtape.justificatifsTypesSpecifiques = justificatifsTypesSpecifiques

  return titreEtape
}

export const titreEtapeSdomZonesGet = async (
  geoJson: Feature<any>
): Promise<GeoJsonResult<SDOMZoneId[]>> => {
  const sdomZoneIds = await geojsonIntersectsSDOM(geoJson)

  return {
    fallback: sdomZoneIds.fallback,
    data: sdomZoneIds.data
  }
}

export const documentTypeIdsBySdomZonesGet = (
  sdomZones: SDOMZoneId[] | null | undefined,
  titreTypeId: string,
  demarcheTypeId: string,
  etapeTypeId: string
) => {
  const documentTypeIds: DocumentTypeId[] = []

  // Pour les demandes d’octroi d’AXM
  if (
    etapeTypeId === ETAPES_TYPES.demande &&
    demarcheTypeId === DEMARCHES_TYPES_IDS.Octroi &&
    titreTypeId ===
      toTitreTypeId(
        TITRES_TYPES_TYPES_IDS.AUTORISATION_D_EXPLOITATION,
        DOMAINES_IDS.METAUX
      )
  ) {
    if (sdomZones?.find(id => id === SDOMZoneIds.Zone2)) {
      // dans la zone 2 du SDOM les documents suivants sont obligatoires:
      documentTypeIds.push(DOCUMENTS_TYPES_IDS.noticeDImpactRenforcee)
      documentTypeIds.push(
        DOCUMENTS_TYPES_IDS.justificationDExistenceDuGisement
      )
    } else {
      documentTypeIds.push(DOCUMENTS_TYPES_IDS.noticeDImpact)
    }
  }

  return documentTypeIds
}
