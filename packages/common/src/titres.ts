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
import { EntrepriseId, entrepriseIdValidator } from './entreprise.js'
import { isFondamentalesStatutOk } from './static/etapesStatuts.js'
import { ETAPE_IS_NOT_BROUILLON } from './etape.js'

const commonTitreValidator = z.object({
  id: titreIdValidator,
  nom: z.string(),
  slug: titreSlugValidator,
  type_id: titreTypeIdValidator,
  titre_statut_id: titreStatutIdValidator,
  administrations_locales: z.array(administrationIdValidator.brand('administrationLocale')),
  references: z.array(titreReferenceValidator),
  titulaireIds: z.array(entrepriseIdValidator),
})

/** @deprecated use CommonRestTitre */
export interface CommonTitre {
  id: TitreId
  nom: string
  slug: string
  typeId: TitreTypeId
  titreStatutId: TitreStatutId
  references: TitreReference[]
  titulaireIds: EntrepriseId[]
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
  | Pick<DemarcheEtapeNonFondamentale, 'etape_statut_id' | 'etape_type_id' | 'ordre' | 'is_brouillon'>
  | Pick<DemarcheEtapeFondamentale, 'etape_statut_id' | 'etape_type_id' | 'fondamentale' | 'ordre' | 'is_brouillon'>
export type TitrePropTitreEtapeFindDemarche<F extends Pick<DemarcheEtape, 'etape_statut_id' | 'etape_type_id' | 'ordre' | 'is_brouillon'>> = Pick<TitreGetDemarche, 'ordre'> & {
  etapes: F[]
}

export const getMostRecentValuePropFromEtapeFondamentaleValide = <
  P extends 'titulaireIds' | 'amodiataireIds' | 'perimetre' | 'substances' | 'duree',
  F extends Pick<DemarcheEtapeFondamentale, 'etape_statut_id' | 'etape_type_id' | 'ordre' | 'fondamentale' | 'is_brouillon'>,
  NF extends Pick<DemarcheEtapeNonFondamentale, 'etape_statut_id' | 'etape_type_id' | 'ordre' | 'is_brouillon'>,
>(
  propId: P,
  titreDemarches: TitrePropTitreEtapeFindDemarche<F | NF>[]
): DemarcheEtapeFondamentale['fondamentale'][P] | null => {
  const titreDemarchesDesc: TitrePropTitreEtapeFindDemarche<F | NF>[] = [...titreDemarches].sort((a, b) => b.ordre - a.ordre)

  for (const titreDemarche of titreDemarchesDesc) {
    const titreEtapeDesc = [...titreDemarche.etapes].sort((a, b) => b.ordre - a.ordre).filter((etape): etape is F => 'fondamentale' in etape)
    for (const titreEtape of titreEtapeDesc) {
      if (isFondamentalesStatutOk(titreEtape.etape_statut_id) && (titreEtape.is_brouillon === ETAPE_IS_NOT_BROUILLON || titreEtapeDesc.length === 1)) {
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
  demarche_type_id: demarcheTypeIdValidator,
  demarche_description: z.string().nullable(),
  titre_id: titreIdValidator,
  titre_slug: titreSlugValidator,
  titre_type_id: titreTypeIdValidator,
  titre_nom: z.string(),
})

export type GetDemarcheByIdOrSlugValidator = z.infer<typeof getDemarcheByIdOrSlugValidator>

export const titreDemandeValidator = z.object({
  nom: z.string(),
  typeId: titreTypeIdValidator,
  entrepriseId: entrepriseIdValidator,
  references: z.array(titreReferenceValidator),
  titreFromIds: z.array(titreIdValidator),
})

export type TitreDemande = z.infer<typeof titreDemandeValidator>
