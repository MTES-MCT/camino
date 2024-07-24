import { IHeritageContenu, IHeritageElement, IHeritageProps, ITitreDemarche, ITitreEtape } from '../../../types'

import { titreEtapeHeritagePropsFind } from '../../../business/utils/titre-etape-heritage-props-find'
import { titreEtapeHeritageContenuFind } from '../../../business/utils/titre-etape-heritage-contenu-find'
import { titreEtapesSortAscByOrdre, titreEtapesSortDescByOrdre } from '../../../business/utils/titre-etapes-sort'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DeepReadonly, getKeys } from 'camino-common/src/typescript-tools'
import { getSections, Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { ETAPE_HERITAGE_PROPS, isHeritageProps } from 'camino-common/src/heritage'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { CaminoDate } from 'camino-common/src/date'
import { EtapeId } from 'camino-common/src/etape'

const titreEtapeHeritagePropsBuild = (date: CaminoDate, titreEtapes: ITitreEtape[] | null, etapeId: EtapeId | null) => {
  const titreEtapesFiltered = titreEtapesSortAscByOrdre(
    titreEtapes?.filter(e => {
      if (e.id === etapeId) {
        return false
      }
      if (EtapesTypes[e.typeId].fondamentale && e.date <= date) {
        return true
      }

      return false
    }) ?? []
  )

  const heritageProps = ETAPE_HERITAGE_PROPS.reduce((acc: IHeritageProps, id) => {
    acc[id] = { actif: !!titreEtapesFiltered.length }

    return acc
  }, {} as IHeritageProps)

  const titreEtape = { date, heritageProps } as ITitreEtape

  titreEtapesFiltered.push(titreEtape)

  titreEtapesFiltered.forEach((te: ITitreEtape, index: number) => {
    const titreEtapePrecedente = index > 0 ? titreEtapesFiltered[index - 1] : null

    const { titreEtape } = titreEtapeHeritagePropsFind(te, titreEtapePrecedente)

    titreEtapesFiltered[index] = titreEtape
  })

  const newTitreEtape = titreEtapesFiltered[titreEtapesFiltered.length - 1]

  if (newTitreEtape.heritageProps) {
    getKeys(newTitreEtape.heritageProps, isHeritageProps).forEach(id => {
      const etapeId = newTitreEtape.heritageProps && newTitreEtape.heritageProps[id].etapeId

      if (etapeId) {
        newTitreEtape.heritageProps![id].etape = titreEtapesFiltered.find(({ id }) => id === etapeId)
      }
    })
  }

  return newTitreEtape
}

const titreEtapeHeritageContenuBuild = (
  date: CaminoDate,
  etapeTypeId: EtapeTypeId,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  titreEtapes: ITitreEtape[] | null,
  etapeId: EtapeId | null
) => {
  if (!titreEtapes) {
    titreEtapes = []
  }

  const sections = getSections(titreTypeId, demarcheTypeId, etapeTypeId)
  const titreEtape = {
    id: 'new-titre-etape',
    date,
    typeId: etapeTypeId,
  } as ITitreEtape

  let titreEtapesFiltered = titreEtapesSortDescByOrdre(titreEtapes.filter(te => te.date < date && te.id !== etapeId))

  titreEtapesFiltered.splice(0, 0, titreEtape)

  const etapeSectionsDictionary = titreEtapesFiltered.reduce<{
    [etapeId: string]: DeepReadonly<Section[]>
  }>((acc, e) => {
    acc[e.id] = getSections(titreTypeId, demarcheTypeId, e.typeId)

    return acc
  }, {})

  titreEtape.heritageContenu = sections.reduce((heritageContenu: IHeritageContenu, section) => {
    if (!section.elements?.length) return heritageContenu

    heritageContenu[section.id] = section.elements?.reduce(
      (acc: { [elementId: string]: IHeritageElement }, element) => {
        acc[element.id] = {
          actif: !!titreEtapesFiltered.find(
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            e => e.id !== titreEtape.id && etapeSectionsDictionary[e.id] && etapeSectionsDictionary[e.id].find(s => s.id === section.id && s.elements?.find(el => el.id === element.id))
          ),
        }

        return acc
      },
      {} as { [elementId: string]: IHeritageElement }
    )

    return heritageContenu
  }, {})

  titreEtapesFiltered = titreEtapesFiltered.filter(e => etapeSectionsDictionary[e.id])

  const { contenu, heritageContenu } = titreEtapeHeritageContenuFind(titreEtapesFiltered, titreEtape, etapeSectionsDictionary)

  if (heritageContenu) {
    Object.keys(heritageContenu).forEach(sectionId => {
      Object.keys(heritageContenu![sectionId]).forEach(elementId => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const etapeId = heritageContenu && heritageContenu[sectionId] && heritageContenu[sectionId][elementId].etapeId

        if (etapeId) {
          heritageContenu![sectionId][elementId].etape = titreEtapesFiltered.find(({ id }) => id === etapeId)
        }
      })
    })
  }

  return { contenu, heritageContenu }
}

export const titreEtapeHeritageBuild = (
  date: CaminoDate,
  etapeTypeId: EtapeTypeId,
  titreDemarche: ITitreDemarche,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  etapeId: EtapeId | null
) => {
  let titreEtape = {} as ITitreEtape

  const etapeType = EtapesTypes[etapeTypeId]

  if (etapeType.fondamentale) {
    titreEtape = titreEtapeHeritagePropsBuild(date, titreDemarche.etapes ?? [], etapeId)
  }

  const sections = getSections(titreTypeId, demarcheTypeId, etapeType.id)
  if (sections?.length) {
    const { contenu, heritageContenu } = titreEtapeHeritageContenuBuild(date, etapeTypeId, titreTypeId, demarcheTypeId, titreDemarche.etapes ?? [], etapeId)

    titreEtape.contenu = contenu
    titreEtape.heritageContenu = heritageContenu
  }

  titreEtape.typeId = etapeTypeId
  titreEtape.titreDemarcheId = titreDemarche.id

  return titreEtape
}
