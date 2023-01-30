import { TitreStatutId } from './static/titresStatuts.js'
import { TitreReference } from './titres-references.js'
import { EtapeTypeId } from './static/etapesTypes.js'
import { CaminoDate } from './date.js'
import { TitreTypeId } from './static/titresTypes'

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
  value: CaminoDate
} & BasicElement

type FileElement = {
  type: 'file'
  value: string
} & BasicElement

type TextElement = {
  type: 'text'
  value: string
} & BasicElement

type NumberElement = {
  type: 'number' | 'integer'
  value: number
} & BasicElement

type RadioElement = {
  type: 'radio'
  value: boolean
} & BasicElement

type CheckboxesElement = {
  type: 'checkboxes'
  options: { id: string; nom: string }[]
  value: string[]
} & BasicElement

type SelectElement = {
  type: 'select'
  options: { id: string; nom: string }[]
  value: string
} & BasicElement

export type Element = FileElement | DateElement | TextElement | NumberElement | RadioElement | CheckboxesElement | SelectElement

export const isTextElement = (element: Element): element is TextElement => {
  return element.type === 'text'
}

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
