import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { IContenu } from '../../../types.js'

export const contenuNumbersCheck = (sections: DeepReadonly<Section[]>, contenu: IContenu) => {
  const errors = sections.reduce((errors: string[], section) => {
    if (!section.elements) return errors

    return section.elements.reduce((errors, element) => {
      if (element.type === 'number' && contenu[section.id] && contenu[section.id][element.id]) {
        const value = contenu[section.id][element.id]

        if (typeof value === 'number' && value < 0) {
          errors.push(`le champ "${element.id}" ne peut pas avoir une valeur négative`)
        }
      }

      return errors
    }, errors)
  }, [])

  if (errors.length) {
    return errors.join(', ')
  }

  return null
}
