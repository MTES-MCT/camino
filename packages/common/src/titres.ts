import { TitreStatutId, titreStatutIdValidator } from './static/titresStatuts.js'
import { TitreReference, titreReferenceValidator } from './titres-references.js'
import { etapeTypeIdValidator } from './static/etapesTypes.js'
import { caminoDateValidator } from './date.js'
import { TitreTypeId, titreTypeIdValidator } from './static/titresTypes.js'
import { z } from 'zod'
import { administrationIdValidator } from './static/administrations.js'
import { DemarcheEtape, DemarcheEtapeFondamentale, DemarcheEtapeNonFondamentale, demarcheEtapeValidator, demarcheIdValidator, demarcheSlugValidator } from './demarche.js'
import { demarcheStatutIdValidator } from './static/demarchesStatuts.js'
import { demarcheTypeIdValidator } from './static/demarchesTypes.js'
import { TitreId, titreIdValidator, titreSlugValidator } from './validators/titres.js'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from './typescript-tools.js'

const commonTitreValidator = z.object({
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

export const demarcheGetValidator = z.object({
  id: demarcheIdValidator,
  slug: demarcheSlugValidator,
  description: z.string().nullable(),
  etapes: z.array(demarcheEtapeValidator),
  demarche_type_id: demarcheTypeIdValidator,
  demarche_statut_id: demarcheStatutIdValidator,
  demarche_date_debut: caminoDateValidator.nullable(),
  demarche_date_fin: caminoDateValidator.nullable(),
  ordre: z.number(),
})

export type TitreGetDemarche = z.infer<typeof demarcheGetValidator>

export const titreGetValidator = z.object({
  id: titreIdValidator,
  nom: z.string(),
  slug: titreSlugValidator,
  titre_type_id: titreTypeIdValidator,
  titre_statut_id: titreStatutIdValidator,
  titre_doublon: z
    .object({
      id: titreIdValidator,
      nom: z.string(),
    })
    .nullable(),
  references: z.array(titreReferenceValidator),
  titre_last_modified_date: caminoDateValidator.nullable(),
  demarches: z.array(demarcheGetValidator),
  nb_activites_to_do: z.number().nullable(),
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

const titreLinkValidator = commonTitreValidator.pick({ id: true, nom: true })
export type TitreLink = z.infer<typeof titreLinkValidator>

export const titreLinksValidator = z.object({
  amont: z.array(titreLinkValidator),
  aval: z.array(titreLinkValidator),
})
export type TitreLinks = z.infer<typeof titreLinksValidator>

export const utilisateurTitreAbonneValidator = z.object({ abonne: z.boolean() })

/**
 * Trouve l'id de l'étape de référence pour une propriété
 * @param propId - nom de la propriété
 * @param titreDemarchesAsc - démarches du titre
 * @returns une étape fondamentale
 */

/**
 * @public pour les tests
 */
export type TitrePropTitreEtapeFindDemarcheEtape =
  | Pick<DemarcheEtapeNonFondamentale, 'etape_statut_id' | 'etape_type_id' | 'ordre'>
  | Pick<DemarcheEtapeFondamentale, 'etape_statut_id' | 'etape_type_id' | 'fondamentale' | 'ordre'>
export type TitrePropTitreEtapeFindDemarche<F extends Pick<DemarcheEtape, 'etape_statut_id' | 'etape_type_id' | 'ordre'>> = Pick<TitreGetDemarche, 'ordre'> & {
  etapes: F[]
}

// FIXME tests
export const getMostRecentValuePropFromEtapeFondamentaleValide = <
  P extends 'titulaires' | 'amodiataires' | 'perimetre' | 'substances',
  F extends Pick<DemarcheEtapeFondamentale, 'etape_statut_id' | 'etape_type_id' | 'ordre' | 'fondamentale'>,
  NF extends Pick<DemarcheEtapeNonFondamentale, 'etape_statut_id' | 'etape_type_id' | 'ordre'>
>(
  propId: P,
  titreDemarches: TitrePropTitreEtapeFindDemarche<F | NF>[]
): DemarcheEtapeFondamentale['fondamentale'][P] | null => {
  const titreDemarchesDesc: TitrePropTitreEtapeFindDemarche<F | NF>[] = [...titreDemarches].sort((a, b) => b.ordre - a.ordre)

  for (const titreDemarche of titreDemarchesDesc) {
    const titreEtapeDesc = [...titreDemarche.etapes].sort((a, b) => b.ordre - a.ordre)
    for (const titreEtape of titreEtapeDesc) {
      if ('fondamentale' in titreEtape && ['acc', 'fai', 'fav', 'aco'].includes(titreEtape.etape_statut_id)) {
        const value = titreEtape.fondamentale[propId]
        if ((Array.isArray(value) && isNotNullNorUndefinedNorEmpty(value)) || (!Array.isArray(value) && isNotNullNorUndefined(value))) {
          return value
        }
      }
    }
  }

  return null
}

export const getDemarcheByIdOrSlugValidator = z.object({
  demarche_id: demarcheIdValidator,
  demarche_slug: demarcheSlugValidator,
  titre_id: titreIdValidator,
})

export type GetDemarcheByIdOrSlugValidator = z.infer<typeof getDemarcheByIdOrSlugValidator>
