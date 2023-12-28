import { caminoDateValidator, dateFormat } from './date.js'
import { numberFormat } from './number.js'
import {
  checkboxElementValidator,
  checkboxesElementValidator,
  dateElementValidator,
  fileElementValidator,
  numberElementValidator,
  radioElementValidator,
  selectElementWithOptionsValidator,
  textElementValidator,
  urlElementValidator,
} from './static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { z } from 'zod'
import { isNotNullNorUndefined } from './typescript-tools.js'

const dateElementWithValueValidator = dateElementValidator.extend({ value: caminoDateValidator.nullable() })
export type DateElementWithValue = z.infer<typeof dateElementWithValueValidator>

const fileElementWithValueValidator = fileElementValidator.extend({ value: z.string().nullable() })
export type FileElementWithValue = z.infer<typeof fileElementWithValueValidator>

const textElementWithValueValidator = textElementValidator.extend({ value: z.string().nullable() })
export type TextElementWithValue = z.infer<typeof textElementWithValueValidator>

const urlElementWithValueValidator = urlElementValidator.extend({ value: z.string().nullable() })
export type UrlElementWithValue = z.infer<typeof urlElementWithValueValidator>

const numberElementWithValueValidator = numberElementValidator.extend({ value: z.number().nullable() })
export type NumberElementWithValue = z.infer<typeof numberElementWithValueValidator>

const radioElementWithValueValidator = radioElementValidator.extend({ value: z.boolean().nullable() })
export type RadioElementWithValue = z.infer<typeof radioElementWithValueValidator>

const checkboxElementWithValueValidator = checkboxElementValidator.extend({ value: z.boolean().nullable() })
export type CheckboxElementWithValue = z.infer<typeof checkboxElementWithValueValidator>

const checkboxesElementWithValueValidator = checkboxesElementValidator.extend({ value: z.array(z.string()) })
export type CheckboxesElementWithValue = z.infer<typeof checkboxesElementWithValueValidator>

const selectElementWithValueValidator = selectElementWithOptionsValidator.extend({
  value: z.string().nullable(),
})

export type SelectElementWithValue = z.infer<typeof selectElementWithValueValidator>

const elementWithValueValidator = z.union([
  fileElementWithValueValidator,
  dateElementWithValueValidator,
  textElementWithValueValidator,
  urlElementWithValueValidator,
  numberElementWithValueValidator,
  radioElementWithValueValidator,
  checkboxElementWithValueValidator,
  checkboxesElementWithValueValidator,
  selectElementWithValueValidator,
])

export type ElementWithValue = z.infer<typeof elementWithValueValidator>

export const isFileElement = (element: ElementWithValue): element is FileElementWithValue => {
  return element.type === 'file'
}

export const isNumberElement = (element: ElementWithValue): element is NumberElementWithValue => {
  return element.type === 'number' || element.type === 'integer'
}

export const sectionWithValueValidator = z.object({ id: z.string(), nom: z.string().optional(), elements: z.array(elementWithValueValidator) })

export type SectionWithValue = z.infer<typeof sectionWithValueValidator>

export const valeurFind = (element: ElementWithValue): string | '–' => {
  if (element.value === null || element.value === '') {
    return '–'
  }

  if (isNumberElement(element)) {
    return numberFormat(element.value)
  }

  if (element.type === 'checkboxes') {
    return element.value
      .map(id => {
        const option = element.options.find(e => e.id === id)

        return option ? option.nom : undefined
      })
      .filter(valeur => isNotNullNorUndefined(valeur))
      .join(', ')
  }

  if (element.type === 'select') {
    return element.options.find(v => v.id === element.value)?.nom ?? '-'
  }

  if (element.type === 'date') {
    return dateFormat(element.value)
  }

  if (element.type === 'radio' || element.type === 'checkbox') {
    if (element.value === undefined) return '–'
    else if (element.value) return 'Oui'
    else return 'Non'
  }

  return element.value
}
