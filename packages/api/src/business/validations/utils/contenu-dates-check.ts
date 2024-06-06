import { caminoDateValidator } from 'camino-common/src/date.js'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'
import { FlattenedContenuElement } from 'camino-common/src/etape-form.js'

export const contenuDatesCheck = (sections: DeepReadonly<Section[]>, contenu: Record<string, Record<string, Pick<FlattenedContenuElement, 'value'>>>) => {
  const errors = sections.reduce(
    (errors: string[], section) =>
      isNotNullNorUndefinedNorEmpty(section.elements) && isNotNullNorUndefined(contenu[section.id])
        ? section.elements.reduce((errors, element) => {
            if (element.type === 'date' && isNotNullNorUndefined(contenu[section.id][element.id])) {
              const { success, error } = caminoDateValidator.safeParse(contenu[section.id][element.id])
              if (!success) {
                errors.push(`le champ "${element.id}" est invalide`, error.message)
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
