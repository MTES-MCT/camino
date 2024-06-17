import { ElementWithValue } from '../sections.js'
import { DeepReadonly, isNullOrUndefined } from '../typescript-tools.js'

// @deprecated ==> type better
export type Contenu = { [key in string]?: { [secondKey in string]?: unknown } } | null

export const sectionsWithValueCompleteValidate = (sections_with_value: DeepReadonly<{ nom?: string; elements: Pick<ElementWithValue, 'nom' | 'optionnel' | 'value' | 'type'>[] }[]>): string[] => {
  const errors: string[] = []
  sections_with_value.forEach(s =>
    s.elements.forEach(e => {
      if (!sectionElementWithValueCompleteValidate(e)) {
        errors.push(`l’élément "${e.nom}" de la section "${s.nom}" est obligatoire`)
      }
    })
  )

  return errors
}

export const sectionElementWithValueCompleteValidate = (elementWithValue: DeepReadonly<Pick<ElementWithValue, 'optionnel' | 'value' | 'type'>>): boolean => {
  if ((isNullOrUndefined(elementWithValue.optionnel) || !elementWithValue.optionnel) && !['checkbox'].includes(elementWithValue.type)) {
    if (elementWithValue.value === undefined || elementWithValue.value === null || elementWithValue.value === '') {
      return false
    }
  }

  return true
}
