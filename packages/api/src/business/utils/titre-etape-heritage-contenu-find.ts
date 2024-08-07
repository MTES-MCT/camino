import { IContenuValeur, Index, ITitreEtape } from '../../types'

import { DeepReadonly } from 'camino-common/src/typescript-tools'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'

export const heritageContenuFind = (
  sectionId: string,
  elementId: string,
  titreEtape: Pick<ITitreEtape, 'contenu' | 'heritageContenu'>,
  prevTitreEtape?: Pick<ITitreEtape, 'id' | 'contenu' | 'heritageContenu'> | null
) => {
  let hasChanged = false
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  let value = (titreEtape.contenu && titreEtape.contenu[sectionId] && titreEtape.contenu[sectionId][elementId]) as IContenuValeur

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  let heritage = titreEtape.heritageContenu && titreEtape.heritageContenu[sectionId] ? titreEtape.heritageContenu[sectionId][elementId] : null
  if (!heritage) {
    // l’héritage peut ne pas exister dans le cas où un nouvel élément d’une section a été ajouté via les métas
    heritage = {
      actif: false,
      etapeId: null,
    }
    hasChanged = true
  }
  const prevHeritage = prevTitreEtape?.heritageContenu![sectionId][elementId]

  let actif = heritage.actif

  const etapeId = prevHeritage?.etapeId && prevHeritage?.actif ? prevHeritage.etapeId : prevTitreEtape?.id

  if (heritage.actif) {
    if (prevTitreEtape) {
      const oldValue = value
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      value = (prevTitreEtape.contenu && prevTitreEtape.contenu[sectionId] && prevTitreEtape.contenu[sectionId][elementId]) as IContenuValeur

      if ((oldValue !== undefined || value !== null) && (oldValue !== null || value !== undefined) && oldValue !== value) {
        hasChanged = true
      }
    } else {
      // si l’étape précédente a été supprimée il faut désactiver l’héritage
      actif = false
      hasChanged = true
    }
  }

  if ((etapeId || heritage.etapeId) && etapeId !== heritage.etapeId) {
    hasChanged = true
  }

  return { hasChanged, value, etapeId, actif }
}

export const titreEtapeHeritageContenuFind = (
  titreEtapes: Omit<ITitreEtape, 'titreDemarcheId' | 'isBrouillon'>[],
  titreEtape: Pick<ITitreEtape, 'id' | 'contenu' | 'heritageContenu'>,
  etapeSectionsDictionary: Index<DeepReadonly<Section[]>>
) => {
  const sections = etapeSectionsDictionary[titreEtape.id]

  return sections.reduce(
    ({ contenu, heritageContenu, hasChanged }, section) => {
      if (section.elements?.length) {
        section.elements.forEach(element => {
          // parmi les étapes précédentes,
          // trouve l'étape qui contient section / element
          const prevTitreEtape = titreEtapes.find(e => e.id !== titreEtape.id && etapeSectionsDictionary[e.id].find(s => s.id === section.id && s.elements!.find(e => e.id === element.id)))

          const { hasChanged: contenuHasChanged, actif, value, etapeId } = heritageContenuFind(section.id, element.id, titreEtape, prevTitreEtape)

          if (contenuHasChanged) {
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (value || value === 0 || value === false) {
              if (!contenu) {
                contenu = {}
              }

              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              if (!contenu[section.id]) {
                contenu[section.id] = {}
              }

              contenu![section.id][element.id] = value
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            } else if (contenu && contenu[section.id]) {
              delete contenu[section.id][element.id]
            }

            if (!heritageContenu) {
              heritageContenu = {}
            }

            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (!heritageContenu[section.id]) {
              heritageContenu[section.id] = {}
            }

            heritageContenu[section.id][element.id] = { actif, etapeId }
            hasChanged = true
          }
        })
      }

      return { contenu, heritageContenu, hasChanged }
    },
    {
      contenu: titreEtape.contenu,
      heritageContenu: titreEtape.heritageContenu,
      hasChanged: false,
    }
  )
}
