import { TitreStatutId } from './static/titresStatuts.js'
import { TitreReference } from './titres-references.js'
import { EtapeTypeId } from './static/etapesTypes.js'
import { CaminoDate, dateFormat } from './date.js'
import { TitreTypeId } from './static/titresTypes.js'
import { numberFormat } from './number.js'
import { CheckboxesElement, DateElement, FileElement, NumberElement, RadioElement, SelectElement, TextElement } from './static/titresTypes_demarchesTypes_etapesTypes/sections.js'

export interface CommonTitre {
  id: string
  slug: string
  nom: string
  typeId: TitreTypeId
  titreStatutId: TitreStatutId
  references: TitreReference[]
  titulaires: { nom: string }[]
}

export interface CommonTitrePTMG extends CommonTitre {
  enAttenteDePTMG: boolean
}

export interface CommonTitreDREAL extends CommonTitre {
  activitesAbsentes: number
  activitesEnConstruction: number
  derniereEtape: { etapeTypeId: EtapeTypeId; date: CaminoDate } | null
  enAttenteDeDREAL: boolean
  prochainesEtapes: EtapeTypeId[]
}

export interface CommonTitreONF extends CommonTitre {
  dateCompletudePTMG: string
  dateReceptionONF: string
  dateCARM: string
  enAttenteDeONF: boolean
}

export type TitreLink = Pick<CommonTitre, 'id' | 'nom'>
export type TitreLinks = { amont: TitreLink[]; aval: TitreLink[] }

type BasicElement = {
  id: string
  nom?: string
  description?: string
  dateDebut?: CaminoDate
  dateFin?: CaminoDate
  optionnel?: boolean
}

type DateElementWithValue = {
  value: CaminoDate | undefined
} & BasicElement &
  DateElement

type FileElementWithValue = {
  value: string | undefined
} & BasicElement &
  FileElement

type TextElementWithValue = {
  value: string | undefined
} & BasicElement &
  TextElement

type NumberElementWithValue = {
  value: number | undefined
} & BasicElement &
  NumberElement

type RadioElementWithValue = {
  value: boolean | undefined
} & BasicElement &
  RadioElement

type CheckboxesElementWithValue = {
  options: { id: string; nom: string }[]
  value: string[]
} & BasicElement &
  CheckboxesElement

type SelectElementWithValue = {
  options: { id: string; nom: string }[]
  value: string | undefined
} & BasicElement &
  SelectElement

export type ElementWithValue = FileElementWithValue | DateElementWithValue | TextElementWithValue | NumberElementWithValue | RadioElementWithValue | CheckboxesElementWithValue | SelectElementWithValue

export const isFileElement = (element: ElementWithValue): element is FileElementWithValue => {
  return element.type === 'file'
}

export const isDateElement = (element: ElementWithValue): element is DateElementWithValue => {
  return element.type === 'date'
}

export const isNumberElement = (element: ElementWithValue): element is NumberElementWithValue => {
  return element.type === 'number' || element.type === 'integer'
}

export const isRadioElement = (element: ElementWithValue): element is RadioElementWithValue => {
  return element.type === 'radio' || element.type === 'checkbox'
}

export const isCheckboxesElement = (element: ElementWithValue): element is CheckboxesElementWithValue => {
  return element.type === 'checkboxes'
}

export const isSelectElement = (element: ElementWithValue): element is SelectElementWithValue => {
  return element.type === 'select'
}

export interface Section {
  id: string
  nom?: string
  elements: ElementWithValue[]
}

export const valeurFind = (element: ElementWithValue): string => {
  if (element.value === undefined || element.value === '') {
    return '–'
  }

  if (isNumberElement(element)) {
    return numberFormat(element.value)
  }

  if (isCheckboxesElement(element)) {
    return element.value
      .map(id => {
        const option = element.options.find(e => e.id === id)

        return option ? option.nom : undefined
      })
      .filter(valeur => !!valeur)
      .join(', ')
  }

  if (isSelectElement(element)) {
    return element.options.find(v => v.id === element.value)?.nom ?? '–'
  }

  if (isDateElement(element)) {
    return dateFormat(element.value)
  }

  if (isRadioElement(element)) {
    if (element.value === undefined) return '–'
    else if (element.value) return 'Oui'
    else return 'Non'
  }

  return element.value
}
