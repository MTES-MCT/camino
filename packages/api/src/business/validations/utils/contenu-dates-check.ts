import { dateValidate } from 'camino-common/src/date.js'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { IContenu } from '../../../types.js'

export const contenuDatesCheck = (sections: DeepReadonly<Section[]>, contenu: IContenu) => {
  const errors = sections.reduce(
    (errors: string[], section) =>
      section.elements && contenu[section.id]
        ? section.elements.reduce((errors, element) => {
            if (element.type === 'date' && contenu[section.id][element.id]) {
              const dateCheck = dateValidate(contenu[section.id][element.id] as string)
              if (!dateCheck.valid) {
                errors.push(`le champ "${element.id}" n'est pas une date valide`)
              }
            }

            return errors
          }, errors)
        : errors,
    []
  )

  if (errors.length) {
    return errors.join(', ')
  }

  return null
}
