import { caminoDateValidator } from 'camino-common/src/date'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { DeepReadonly, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { FlattenedContenuElement } from 'camino-common/src/etape-form'

export const contenuDatesCheck = (sections: DeepReadonly<Section[]>, contenu: Record<string, Record<string, Pick<FlattenedContenuElement, 'value'>>>): string | null => {
  const errors = sections.reduce(
    (errors: string[], section) =>
      isNotNullNorUndefinedNorEmpty(section.elements) && isNotNullNorUndefined(contenu[section.id])
        ? section.elements.reduce((errors, element) => {
            if (element.type === 'date' && isNotNullNorUndefined(contenu[section.id][element.id])) {
              const validator = (element.optionnel ?? false) ? caminoDateValidator.nullable() : caminoDateValidator

              const { success, error } = validator.safeParse(contenu[section.id][element.id].value)
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
