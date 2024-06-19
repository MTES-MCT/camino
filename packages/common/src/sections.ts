import { caminoDateValidator, dateFormat } from './date.js'
import { numberFormat } from './number.js'
import {
  checkboxElementValidator,
  checkboxesElementValidator,
  dateElementValidator,
  getSections,
  numberElementValidator,
  radioElementValidator,
  selectElementWithOptionsValidator,
  textElementValidator,
  urlElementValidator,
} from './static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { z } from 'zod'
import { DeepReadonly, isNotNullNorUndefined } from './typescript-tools.js'
import { TitreTypeId } from './static/titresTypes.js'
import { DemarcheTypeId } from './static/demarchesTypes.js'
import { EtapeTypeId } from './static/etapesTypes.js'
import { EtapeContenu, FlattenEtape, FlattenedContenu, GraphqlEtapeCreation, HeritageContenu } from './etape-form.js'

const dateElementWithValueValidator = dateElementValidator.extend({ value: caminoDateValidator.nullable() })

const textElementWithValueValidator = textElementValidator.extend({ value: z.string().nullable() })

const urlElementWithValueValidator = urlElementValidator.extend({ value: z.string().nullable() })

export const numberElementValueValidator = z.number().nonnegative().nullable()
const numberElementWithValueValidator = numberElementValidator.extend({ value: numberElementValueValidator })
type NumberElementWithValue = z.infer<typeof numberElementWithValueValidator>

const radioElementWithValueValidator = radioElementValidator.extend({ value: z.boolean().nullable() })
type RadioElementWithValue = z.infer<typeof radioElementWithValueValidator>

const checkboxElementWithValueValidator = checkboxElementValidator.extend({ value: z.boolean().nullable() })

const checkboxesElementWithValueValidator = checkboxesElementValidator.extend({ value: z.array(z.string()) })

const selectElementWithValueValidator = selectElementWithOptionsValidator.extend({
  value: z.string().nullable(),
})
const elementWithValueValidator = z.union([
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

export const isNumberElement = (element: DeepReadonly<ElementWithValue>): element is DeepReadonly<NumberElementWithValue> => {
  return element.type === 'number' || element.type === 'integer'
}
export const isRadioElement = (element: DeepReadonly<ElementWithValue>): element is DeepReadonly<RadioElementWithValue> => {
  return element.type === 'radio'
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

export const simpleContenuToFlattenedContenu = (
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  etapeTypeId: EtapeTypeId,
  contenu: EtapeContenu,
  heritageContenu: HeritageContenu
): FlattenedContenu => {
  const sections = getSections(titreTypeId, demarcheTypeId, etapeTypeId)

  return sections.reduce<FlattenedContenu>((accSection, section) => {
    accSection[section.id] = section.elements.reduce<FlattenedContenu[string]>((accElement, element) => {
      const elementHeritage = heritageContenu[section.id]?.[element.id] ?? { actif: false, etape: null }
      const value = elementHeritage.actif ? elementHeritage.etape?.contenu[section.id]?.[element.id] ?? null : contenu?.[section.id]?.[element.id] ?? null
      accElement[element.id] = {
        value,
        heritee: elementHeritage.actif,
        etapeHeritee: isNotNullNorUndefined(elementHeritage.etape)
          ? {
              etapeTypeId: elementHeritage.etape.typeId,
              date: elementHeritage.etape.date,
              value: elementHeritage.etape.contenu[section.id]?.[element.id] ?? null,
            }
          : null,
      }

      return accElement
    }, {})

    return accSection
  }, {})
}

export const flattenContenuToSimpleContenu = (flattenContenu: FlattenEtape['contenu']): GraphqlEtapeCreation['contenu'] => {
  return Object.keys(flattenContenu).reduce<GraphqlEtapeCreation['contenu']>((sectionsAcc, section) => {
    sectionsAcc = {
      ...sectionsAcc,
      [section]: Object.keys(flattenContenu[section]).reduce<GraphqlEtapeCreation['contenu'][string]>((elementsAcc, element) => {
        elementsAcc = { ...elementsAcc, [element]: flattenContenu[section][element].value }

        return elementsAcc
      }, {}),
    }

    return sectionsAcc
  }, {})
}
