import { TitreStatutId } from './static/titresStatuts.js'
import { TitreReference } from './titres-references.js'
import { EtapeTypeId } from './static/etapesTypes.js'
import { CaminoDate, dateFormat } from './date.js'
import { TitreTypeId } from './static/titresTypes.js'
import { numberFormat } from './number.js'

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
}

type DateElement = {
  type: 'date'
  value: CaminoDate | undefined
} & BasicElement

type FileElement = {
  type: 'file'
  value: string | undefined
} & BasicElement

type TextElement = {
  type: 'text'
  value: string | undefined
} & BasicElement

type NumberElement = {
  type: 'number' | 'integer'
  value: number | undefined
} & BasicElement

type RadioElement = {
  type: 'radio'
  value: boolean | undefined
} & BasicElement

type CheckboxesElement = {
  type: 'checkboxes'
  options: { id: string; nom: string }[]
  value: string[]
} & BasicElement

type SelectElement = {
  type: 'select'
  options: { id: string; nom: string }[]
  value: string | undefined
} & BasicElement

export type Element = FileElement | DateElement | TextElement | NumberElement | RadioElement | CheckboxesElement | SelectElement

export const isFileElement = (element: Element): element is FileElement => {
  return element.type === 'file'
}

export const isDateElement = (element: Element): element is DateElement => {
  return element.type === 'date'
}

export const isNumberElement = (element: Element): element is NumberElement => {
  return element.type === 'number' || element.type === 'integer'
}

export const isRadioElement = (element: Element): element is RadioElement => {
  return element.type === 'radio'
}

export const isCheckboxesElement = (element: Element): element is CheckboxesElement => {
  return element.type === 'checkboxes'
}

export const isSelectElement = (element: Element): element is SelectElement => {
  return element.type === 'select'
}

export interface Section {
  id: string
  nom?: string
  elements: Element[]
}

export const valeurFind = (element: Element): string => {
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
