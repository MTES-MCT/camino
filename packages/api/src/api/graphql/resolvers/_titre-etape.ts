import { IEtapeType, IHeritageContenu, IHeritageProps, ITitreDemarche, ITitreEtape } from '../../../types.js'


import { titreEtapeHeritagePropsFind, titreEtapePropsIds } from '../../../business/utils/titre-etape-heritage-props-find.js'
import { titreEtapeHeritageContenuFind } from '../../../business/utils/titre-etape-heritage-contenu-find.js'
import { titreEtapesSortAscByOrdre, titreEtapesSortDescByOrdre } from '../../../business/utils/titre-etapes-sort.js'
import { geojsonIntersectsSDOM, GeoJsonResult } from '../../../tools/geojson.js'
import { Feature } from 'geojson'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { getSections, Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'


const titreEtapeHeritagePropsBuild = (date: string, titreEtapes?: ITitreEtape[] | null) => {
  const titreEtapesFiltered = titreEtapesSortAscByOrdre(titreEtapes?.filter(e => e.type?.fondamentale && e.date <= date) ?? [])

  const heritageProps = titreEtapePropsIds.reduce((acc: IHeritageProps, id) => {
    acc[id] = { actif: !!titreEtapesFiltered.length }

    return acc
  }, {})

  const titreEtape = { date, heritageProps } as ITitreEtape

  titreEtapesFiltered.push(titreEtape)

  titreEtapesFiltered.forEach((te: ITitreEtape, index: number) => {
    const titreEtapePrecedente = index > 0 ? titreEtapesFiltered[index - 1] : null

    const { titreEtape } = titreEtapeHeritagePropsFind(te, titreEtapePrecedente)

    titreEtapesFiltered[index] = titreEtape
  })

  const newTitreEtape = titreEtapesFiltered[titreEtapesFiltered.length - 1]

  if (newTitreEtape.heritageProps) {
    Object.keys(newTitreEtape.heritageProps).forEach(id => {
      const etapeId = newTitreEtape.heritageProps && newTitreEtape.heritageProps[id].etapeId

      if (etapeId) {
        newTitreEtape.heritageProps![id].etape = titreEtapesFiltered.find(({ id }) => id === etapeId)
      }
    })
  }

  return newTitreEtape
}

const titreEtapeHeritageContenuBuild = (date: string, etapeType: IEtapeType, titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, titreEtapes?: ITitreEtape[] | null) => {
  if (!titreEtapes) {
    titreEtapes = []
  }

  const sections = getSections(titreTypeId, demarcheTypeId, etapeType.id)
  const titreEtape = {
    id: 'new-titre-etape',
    date,
    type: etapeType,
    typeId: etapeType.id,
  } as ITitreEtape

  let titreEtapesFiltered = titreEtapesSortDescByOrdre(titreEtapes.filter(te => te.date < date))

  titreEtapesFiltered.splice(0, 0, titreEtape)

  const etapeSectionsDictionary = titreEtapesFiltered.reduce<{
    [etapeId: string]: DeepReadonly<Section[]>
  }>((acc, e) => {
    acc[e.id] = getSections(titreTypeId, demarcheTypeId, e.typeId)

    return acc
  }, {})

  titreEtape.heritageContenu = sections.reduce((heritageContenu: IHeritageContenu, section) => {
    if (!section.elements?.length) return heritageContenu

    heritageContenu[section.id] = section.elements?.reduce((acc: IHeritageProps, element) => {
      acc[element.id] = {
        actif: !!titreEtapesFiltered.find(
          e => e.id !== titreEtape.id && etapeSectionsDictionary[e.id] && etapeSectionsDictionary[e.id].find(s => s.id === section.id && s.elements?.find(el => el.id === element.id))
        ),
      }

      return acc
    }, {})

    return heritageContenu
  }, {})

  titreEtapesFiltered = titreEtapesFiltered.filter(e => etapeSectionsDictionary[e.id])

  const { contenu, heritageContenu } = titreEtapeHeritageContenuFind(titreEtapesFiltered, titreEtape, etapeSectionsDictionary)

  if (heritageContenu) {
    Object.keys(heritageContenu).forEach(sectionId => {
      Object.keys(heritageContenu![sectionId]).forEach(elementId => {
        const etapeId = heritageContenu && heritageContenu[sectionId] && heritageContenu[sectionId][elementId].etapeId

        if (etapeId) {
          heritageContenu![sectionId][elementId].etape = titreEtapesFiltered.find(({ id }) => id === etapeId)
        }
      })
    })
  }

  return { contenu, heritageContenu }
}

export const titreEtapeHeritageBuild = (date: string, etapeType: IEtapeType, titreDemarche: ITitreDemarche, titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) => {
  let titreEtape = {} as ITitreEtape

  if (etapeType.fondamentale) {
    titreEtape = titreEtapeHeritagePropsBuild(date, titreDemarche.etapes)
  }

  const sections = getSections(titreTypeId, demarcheTypeId, etapeType.id)
  if (sections?.length) {
    const { contenu, heritageContenu } = titreEtapeHeritageContenuBuild(date, etapeType, titreTypeId, demarcheTypeId, titreDemarche.etapes)

    titreEtape.contenu = contenu
    titreEtape.heritageContenu = heritageContenu
  }

  titreEtape.type = etapeType
  titreEtape.titreDemarcheId = titreDemarche.id

  return titreEtape
}

export const titreEtapeSdomZonesGet = async (geoJson: Feature<any>): Promise<GeoJsonResult<SDOMZoneId[]>> => {
  const sdomZoneIds = await geojsonIntersectsSDOM(geoJson)

  return {
    fallback: sdomZoneIds.fallback,
    data: sdomZoneIds.data,
  }
}
