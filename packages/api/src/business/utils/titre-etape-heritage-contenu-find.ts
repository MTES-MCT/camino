import { IContenuValeur, Index, ITitreEtape } from '../../types.js'

import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'

export const heritageContenuFind = (sectionId: string, elementId: string, titreEtape: Pick<ITitreEtape, 'contenu' | 'heritageContenu'>, prevTitreEtape?: ITitreEtape | null) => {
  let hasChanged = false
  let value = (titreEtape.contenu && titreEtape.contenu[sectionId] && titreEtape.contenu[sectionId][elementId]) as IContenuValeur

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
  titreEtapes: ITitreEtape[],
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
            if (value || value === 0 || value === false) {
              if (!contenu) {
                contenu = {}
              }

              if (!contenu[section.id]) {
                contenu[section.id] = {}
              }

              contenu![section.id][element.id] = value
            } else if (contenu && contenu[section.id]) {
              delete contenu[section.id][element.id]
            }

            if (!heritageContenu) {
              heritageContenu = {}
            }

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
