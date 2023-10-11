import { TitreStatutId, titreStatutIdValidator } from './static/titresStatuts.js'
import { TitreReference, titreReferenceValidator } from './titres-references.js'
import { etapeTypeIdValidator } from './static/etapesTypes.js'
import { caminoAnneeValidator, caminoDateValidator } from './date.js'
import { TitreTypeId, titreTypeIdValidator } from './static/titresTypes.js'
import { z } from 'zod'
import { administrationIdValidator } from './static/administrations.js'
import { activiteValidator } from './activite.js'

export const titreIdValidator = z.string().brand<'TitreId'>()
export type TitreId = z.infer<typeof titreIdValidator>

export const titreSlugValidator = z.string().brand<'TitreSlug'>()
export type TitreSlug = z.infer<typeof titreSlugValidator>

export const commonTitreValidator = z.object({
  id: titreIdValidator,
  nom: z.string(),
  slug: titreSlugValidator,
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

export const titreAdministrationValidator = commonTitreValidator.omit({ administrations_locales: true }).extend({
  derniereEtape: z.object({ etapeTypeId: etapeTypeIdValidator, date: caminoDateValidator }).nullable(),
  enAttenteDeAdministration: z.boolean(),
  prochainesEtapes: z.array(etapeTypeIdValidator),
})
export type CommonTitreAdministration = z.infer<typeof titreAdministrationValidator>

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

export const utilisateurTitreAbonneValidator = z.object({ abonne: z.boolean() })

export const activitesByTitreValidator = z.array(z.object({ annee: caminoAnneeValidator, activites: z.array(activiteValidator) }))
export type ActivitesByTitre = z.infer<typeof activitesByTitreValidator>
