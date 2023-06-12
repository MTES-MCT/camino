import { TitreStatutId, titreStatutIdValidator } from './static/titresStatuts.js'
import { TitreReference, titreReferenceValidator } from './titres-references.js'
import { etapeTypeIdValidator } from './static/etapesTypes.js'
import { caminoDateValidator, dateFormat } from './date.js'
import { TitreTypeId, titreTypeIdValidator } from './static/titresTypes.js'
import { numberFormat } from './number.js'
import {
  checkboxesElementValidator,
  dateElementValidator,
  fileElementValidator,
  getElementValeurs,
  numberElementValidator,
  radioElementValidator,
  selectElementValidator,
  textElementValidator,
} from './static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { uniteIdValidator } from './static/unites.js'
import { deviseIdValidator } from './static/devise.js'
import { z } from 'zod'
import { administrationIdValidator } from './static/administrations.js'

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

const dateElementWithValueValidator = dateElementValidator.extend({ value: caminoDateValidator.optional() })
type DateElementWithValue = z.infer<typeof dateElementWithValueValidator>

const fileElementWithValueValidator = fileElementValidator.extend({ value: z.string().optional() })
type FileElementWithValue = z.infer<typeof fileElementWithValueValidator>

const textElementWithValueValidator = textElementValidator.extend({ value: z.string().optional() })

const numberElementWithValueValidator = numberElementValidator.extend({ value: z.number().optional() })
type NumberElementWithValue = z.infer<typeof numberElementWithValueValidator>

const radioElementWithValueValidator = radioElementValidator.extend({ value: z.boolean().optional() })
type RadioElementWithValue = z.infer<typeof radioElementWithValueValidator>

const checkboxesElementWithValueValidator = checkboxesElementValidator.extend({ value: z.array(z.string()) })
type CheckboxesElementWithValue = z.infer<typeof checkboxesElementWithValueValidator>

const selectElementWithValueValidator = z.intersection(
  selectElementValidator,
  z.union([
    z.object({ options: z.array(z.object({ id: z.string(), nom: z.string() })), value: z.string().optional() }),
    z.object({ valeursMetasNom: z.literal('unites'), value: uniteIdValidator.optional() }),
    z.object({ valeursMetasNom: z.literal('devises'), value: deviseIdValidator.optional() }),
  ])
)

type SelectElementWithValue = z.infer<typeof selectElementWithValueValidator>

const elementWithValueValidator = z.union([
  fileElementWithValueValidator,
  dateElementWithValueValidator,
  textElementWithValueValidator,
  numberElementWithValueValidator,
  radioElementWithValueValidator,
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
  return element.type === 'radio' || element.type === 'checkbox'
}

export const isCheckboxesElement = (element: ElementWithValue): element is CheckboxesElementWithValue => {
  return element.type === 'checkboxes'
}

export const isSelectElement = (element: ElementWithValue): element is SelectElementWithValue => {
  return element.type === 'select'
}

export const sectionValidator = z.object({ id: z.string(), nom: z.string().optional(), elements: z.array(elementWithValueValidator) })

export type Section = z.infer<typeof sectionValidator>

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
    return getElementValeurs(element).find(v => v.id === element.value)?.nom ?? '-'
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

export const utilisateurTitreAbonneValidator = z.object({ abonne: z.boolean() })
