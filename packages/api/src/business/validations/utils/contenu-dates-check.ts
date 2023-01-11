import { dateValidate } from 'camino-common/src/date.js'
import { ISection, IContenu } from '../../../types.js'

export const contenuDatesCheck = (sections: ISection[], contenu: IContenu) => {
  const errors = sections.reduce(
    (errors: string[], section) =>
      section.elements && contenu[section.id]
        ? section.elements.reduce((errors, element) => {
            if (element.type === 'date' && contenu[section.id][element.id]) {
              const error = dateValidate(
                contenu[section.id][element.id] as string
              )
              if (error) {
                errors.push(
                  `le champ "${element.id}" n'est pas une date valide`
                )
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
