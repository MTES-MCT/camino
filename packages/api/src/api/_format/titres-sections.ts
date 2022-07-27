import { ISection, ISectionElement } from '../../types'

import { objectClone } from '../../tools/index'
import { sortedDevises } from 'camino-common/src/static/devise'
import { UNITES } from 'camino-common/src/static/unites'
import { exhaustiveCheck } from '../../tools/exhaustive-type-check'

const titreSectionElementFormat = (element: ISectionElement) => {
  if (element.valeursMetasNom) {
    switch (element.valeursMetasNom) {
      case 'devises':
        element.valeurs = sortedDevises
        break
      case 'unites':
        element.valeurs = UNITES
        break
      default:
        exhaustiveCheck(element.valeursMetasNom)
    }

    delete element.valeursMetasNom
  }

  if (['radio', 'checkbox'].includes(element.type)) {
    element.optionnel = false
  }

  return element
}

// - ne conserve que les sections qui contiennent des élements
const titreSectionsFormat = (sections: ISection[]) =>
  sections.reduce((sections: ISection[], { id, nom, elements }) => {
    if (elements?.length) {
      const newElements = objectClone(elements)

      sections.push({
        id,
        nom,
        elements: newElements.map(titreSectionElementFormat)
      })
    }

    return sections
  }, [])

export { titreSectionsFormat }
