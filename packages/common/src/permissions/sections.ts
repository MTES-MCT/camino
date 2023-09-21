import { Section } from '../static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { ElementWithValue } from '../sections.js'
import { DeepReadonly, isNullOrUndefined } from '../typescript-tools.js'

export type Contenu = { [key in string]?: { [secondKey in string]?: unknown } } | null | undefined

// @deprecated => sectionsWithValueCompleteValidate
export const contenuCompleteValidate = (sections: DeepReadonly<Section[]>, contenu: Contenu): string[] => {
  const errors: string[] = []
  sections.forEach(s =>
    s.elements?.forEach(e => {
      if (isNullOrUndefined(e.optionnel) && !['radio', 'checkbox'].includes(e.type)) {
        if (!contenu || !contenu[s.id] || contenu[s.id]?.[e.id] === undefined || contenu[s.id]?.[e.id] === null || contenu[s.id]?.[e.id] === '') {
          errors.push(`l’élément "${e.nom}" de la section "${s.nom}" est obligatoire`)
        }
      }
    })
  )

  return errors
}

export const sectionsWithValueCompleteValidate = (sections_with_value: { nom?: string; elements: Pick<ElementWithValue, 'nom' | 'optionnel' | 'value' | 'type'>[] }[]): string[] => {
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

export const sectionElementWithValueCompleteValidate = (elementWithValue: Pick<ElementWithValue, 'optionnel' | 'value' | 'type'>): boolean => {
  if ((isNullOrUndefined(elementWithValue.optionnel) || !elementWithValue.optionnel) && !['checkbox'].includes(elementWithValue.type)) {
    if (elementWithValue.value === undefined || elementWithValue.value === null || elementWithValue.value === '') {
      return false
    }
  }

  return true
}
