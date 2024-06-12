import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly, isNotNullNorUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools.js'
import { numberElementValueValidator } from 'camino-common/src/sections.js'
import { FlattenedContenuElement } from 'camino-common/src/etape-form.js'

export const contenuNumbersCheck = (sections: DeepReadonly<Section[]>, contenu: Record<string, Record<string, Pick<FlattenedContenuElement, 'value'>>>) => {
  const errors = sections.reduce((errors: string[], section) => {
    if (isNullOrUndefinedOrEmpty(section.elements)) return errors

    return section.elements.reduce((errors, element) => {
      if (element.type === 'number' && isNotNullNorUndefined(contenu[section.id]?.[element.id])) {
        const value = contenu[section.id][element.id].value

        const { success, error } = numberElementValueValidator.safeParse(value)
        if (!success) {
          errors.push(`le champ "${element.id}" est invalide: `, error.message)
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
