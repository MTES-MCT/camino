import { TitreStatutId, titreStatutIdValidator } from './static/titresStatuts.js'
import { TitreReference, titreReferenceValidator } from './titres-references.js'
import { etapeTypeIdValidator } from './static/etapesTypes.js'
import { caminoDateValidator, dateFormat } from './date.js'
import { TitreTypeId, titreTypeIdValidator } from './static/titresTypes.js'
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
} from './static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { z } from 'zod'
import { administrationIdValidator } from './static/administrations.js'
import { isNotNullNorUndefined } from './typescript-tools.js'

export const titreIdValidator = z.string().brand<'TitreId'>()
export type TitreId = z.infer<typeof titreIdValidator>

export const commonTitreValidator = z.object({
  id: titreIdValidator,
  nom: z.string(),
  slug: z.string(),
  type_id: titreTypeIdValidator,
  titre_statut_id: titreStatutIdValidator,
  administrations_locales: z.array(administrationIdValidator.brand('administrationLocale')),
  references: z.array(titreReferenceValidator),
  titulaires: z.array(
    z.object({
      nom: z.string().optional(),
    })
  ),
})

/** @deprecated use CommonRestTitre */
export interface CommonTitre {
  id: TitreId
  nom: string
  slug: string
  typeId: TitreTypeId
  titreStatutId: TitreStatutId
  references: TitreReference[]
  titulaires: { nom?: string }[]
}

export type CommonRestTitre = z.infer<typeof commonTitreValidator>

export const titreGetValidator = commonTitreValidator.pick({
  id: true,
  nom: true,
  slug: true,
  type_id: true,
  titre_statut_id: true,
  administrations_locales: true,
})

export type TitreGet = z.infer<typeof titreGetValidator>

export type EditableTitre = Pick<CommonTitre, 'id' | 'nom' | 'references'>

export const editableTitreValidator = commonTitreValidator.pick({
  id: true,
  nom: true,
  references: true,
})
export const titrePtmgValidator = commonTitreValidator.omit({ administrations_locales: true }).extend({
  enAttenteDePTMG: z.boolean(),
})
export type CommonTitrePTMG = z.infer<typeof titrePtmgValidator>

export const titreDrealValidator = commonTitreValidator.omit({ administrations_locales: true }).extend({
  activitesAbsentes: z.number(),
  activitesEnConstruction: z.number(),
  derniereEtape: z.object({ etapeTypeId: etapeTypeIdValidator, date: caminoDateValidator }).nullable(),
  enAttenteDeDREAL: z.boolean(),
  prochainesEtapes: z.array(etapeTypeIdValidator),
})
export type CommonTitreDREAL = z.infer<typeof titreDrealValidator>

export const titreOnfValidator = commonTitreValidator.omit({ administrations_locales: true }).extend({
  dateCompletudePTMG: z.string(),
  dateReceptionONF: z.string(),
  dateCARM: z.string(),
  enAttenteDeONF: z.boolean(),
})
export type CommonTitreONF = z.infer<typeof titreOnfValidator>

export const titreLinkValidator = commonTitreValidator.pick({ id: true, nom: true })
export type TitreLink = z.infer<typeof titreLinkValidator>

export const titreLinksValidator = z.object({
  amont: z.array(titreLinkValidator),
  aval: z.array(titreLinkValidator),
})
export type TitreLinks = z.infer<typeof titreLinksValidator>

const dateElementWithValueValidator = dateElementValidator.extend({ value: caminoDateValidator.nullable() })
export type DateElementWithValue = z.infer<typeof dateElementWithValueValidator>

const fileElementWithValueValidator = fileElementValidator.extend({ value: z.string().nullable() })
export type FileElementWithValue = z.infer<typeof fileElementWithValueValidator>

const textElementWithValueValidator = textElementValidator.extend({ value: z.string().nullable() })
export type TextElementWithValue = z.infer<typeof textElementWithValueValidator>

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

export const isDateElement = (element: ElementWithValue): element is DateElementWithValue => {
  return element.type === 'date'
}

export const isNumberElement = (element: ElementWithValue): element is NumberElementWithValue => {
  return element.type === 'number' || element.type === 'integer'
}

export const isRadioElement = (element: ElementWithValue): element is RadioElementWithValue => {
  return element.type === 'radio'
}

export const isCheckboxesElement = (element: ElementWithValue): element is CheckboxesElementWithValue => {
  return element.type === 'checkboxes'
}

export const isCheckboxElement = (element: ElementWithValue): element is CheckboxElementWithValue => {
  return element.type === 'checkbox'
}

export const isSelectElement = (element: ElementWithValue): element is SelectElementWithValue => {
  return element.type === 'select'
}

export const sectionWithValueValidator = z.object({ id: z.string(), nom: z.string().optional(), elements: z.array(elementWithValueValidator) })

export type SectionWithValue = z.infer<typeof sectionWithValueValidator>

export const valeurFind = (element: ElementWithValue): string => {
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

export const utilisateurTitreAbonneValidator = z.object({ abonne: z.boolean() })
