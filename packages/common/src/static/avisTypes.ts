import { z } from 'zod'
import { isNonEmptyArray, isNullOrUndefined, NonEmptyArray } from '../typescript-tools'

interface Definition<T> {
  id: T
  nom: string
  statutIds: AvisStatutId[]
}
// prettier-ignore
const AVIS_TYPES_IDS_WITHOUT_AUTRE = [ "confirmationAccordProprietaireDuSol", "avisDirectionRegionaleDesAffairesCulturelles", "avisDirectionAlimentationAgricultureForet", "avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques", "avisDirectionsRégionalesEconomieEmploiTravailSolidarités", "avisDirectionRegionaleFinancesPubliques", "avisGendarmerieNationale", "avisParcNaturelMarin", "avisIFREMER", "avisInstitutNationalOrigineQualite", "avisEtatMajorOrpaillagePecheIllicite", "avisServiceAdministratifLocal", "avisAutoriteMilitaire", "avisParcNational", "avisDirectionDepartementaleTerritoiresMer", "avisAgenceRegionaleSante", "avisCaisseGeneraleSecuriteSociale", "avisServiceMilieuxNaturelsBiodiversiteSitesPaysages", "avisOfficeNationalDesForets", "expertiseOfficeNationalDesForets", "avisDUneCollectivite", "avisDeLaMissionAutoriteEnvironnementale", "avisProprietaireDuSol", "avisCasParCas", "avisDuConseilGeneralDeLEconomie"] as const
const AVIS_TYPE_IDS_AUTRE = ['autreAvis'] as const

const AVIS_TYPES_IDS = [...AVIS_TYPES_IDS_WITHOUT_AUTRE, ...AVIS_TYPE_IDS_AUTRE] as const

const avisTypeIdValidator = z.enum(AVIS_TYPES_IDS)
export type AvisTypeId = z.infer<typeof avisTypeIdValidator>

export const autreAvisTypeIdValidator = z.enum(AVIS_TYPE_IDS_AUTRE)
export const avisTypeIdSansAutreValidator = z.enum(AVIS_TYPES_IDS_WITHOUT_AUTRE)

const defaultStatutIds = ['Favorable', 'Défavorable', 'Favorable avec réserves', 'Non renseigné'] as const satisfies AvisStatutId[]

export const AVIS_TYPES = {
  confirmationAccordProprietaireDuSol: 'confirmationAccordProprietaireDuSol',
  avisDirectionRegionaleDesAffairesCulturelles: 'avisDirectionRegionaleDesAffairesCulturelles',
  avisDirectionAlimentationAgricultureForet: 'avisDirectionAlimentationAgricultureForet',
  avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques: 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques',
  avisServiceMilieuxNaturelsBiodiversiteSitesPaysages: 'avisServiceMilieuxNaturelsBiodiversiteSitesPaysages',
  avisDirectionsRégionalesEconomieEmploiTravailSolidarités: 'avisDirectionsRégionalesEconomieEmploiTravailSolidarités',
  avisDirectionRegionaleFinancesPubliques: 'avisDirectionRegionaleFinancesPubliques',
  avisGendarmerieNationale: 'avisGendarmerieNationale',
  avisParcNaturelMarin: 'avisParcNaturelMarin',
  avisIFREMER: 'avisIFREMER',
  avisOfficeNationalDesForets: 'avisOfficeNationalDesForets',
  expertiseOfficeNationalDesForets: 'expertiseOfficeNationalDesForets',
  avisInstitutNationalOrigineQualite: 'avisInstitutNationalOrigineQualite',
  avisEtatMajorOrpaillagePecheIllicite: 'avisEtatMajorOrpaillagePecheIllicite',
  avisServiceAdministratifLocal: 'avisServiceAdministratifLocal',
  avisAutoriteMilitaire: 'avisAutoriteMilitaire',
  avisParcNational: 'avisParcNational',
  avisDirectionDepartementaleTerritoiresMer: 'avisDirectionDepartementaleTerritoiresMer',
  avisAgenceRegionaleSante: 'avisAgenceRegionaleSante',
  avisCaisseGeneraleSecuriteSociale: 'avisCaisseGeneraleSecuriteSociale',
  avisDUneCollectivite: 'avisDUneCollectivite',
  avisDeLaMissionAutoriteEnvironnementale: 'avisDeLaMissionAutoriteEnvironnementale',
  avisProprietaireDuSol: 'avisProprietaireDuSol',
  avisCasParCas: 'avisCasParCas',
  avisDuConseilGeneralDeLEconomie: 'avisDuConseilGeneralDeLEconomie',
  autreAvis: 'autreAvis',
} as const satisfies { [key in AvisTypeId]: AvisTypeId }
const AvisTypes = {
  confirmationAccordProprietaireDuSol: { id: 'confirmationAccordProprietaireDuSol', nom: "Confirmation de l'accord du propriétaire du sol", statutIds: defaultStatutIds },
  avisDirectionRegionaleDesAffairesCulturelles: {
    id: 'avisDirectionRegionaleDesAffairesCulturelles',
    nom: 'Avis de la Direction Régionale Des Affaires Culturelles (DRAC)',
    statutIds: defaultStatutIds,
  },
  avisDirectionAlimentationAgricultureForet: {
    id: 'avisDirectionAlimentationAgricultureForet',
    nom: "Avis de la Direction de l'Alimentation de l'Agriculture et de la Forêt (DRAF)",
    statutIds: defaultStatutIds,
  },
  avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques: {
    id: 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques',
    nom: "Avis du Conseil Départemental de l'Environnement et des Risques Sanitaires et Technologiques (CODERST)",
    statutIds: defaultStatutIds,
  },
  avisServiceMilieuxNaturelsBiodiversiteSitesPaysages: {
    id: 'avisServiceMilieuxNaturelsBiodiversiteSitesPaysages',
    nom: 'Avis du Service Milieux Naturels Biodiversité Sites Et Paysages (MNBST) de la DGTM',
    statutIds: defaultStatutIds,
  },
  avisDirectionsRégionalesEconomieEmploiTravailSolidarités: {
    id: 'avisDirectionsRégionalesEconomieEmploiTravailSolidarités',
    nom: "Avis de la Direction régionale de l'économie, de l'emploi, du travail et des solidarités",
    statutIds: defaultStatutIds,
  },
  avisDirectionRegionaleFinancesPubliques: { id: 'avisDirectionRegionaleFinancesPubliques', nom: 'Avis de la Direction Regionale Des Finances Publiques', statutIds: defaultStatutIds },
  avisGendarmerieNationale: { id: 'avisGendarmerieNationale', nom: 'Avis de la Gendarmerie Nationale', statutIds: defaultStatutIds },
  avisParcNaturelMarin: { id: 'avisParcNaturelMarin', nom: 'Avis du Parc Naturel Marin', statutIds: defaultStatutIds },
  avisIFREMER: { id: 'avisIFREMER', nom: "Avis de l'IFREMER", statutIds: defaultStatutIds },
  avisOfficeNationalDesForets: { id: 'avisOfficeNationalDesForets', nom: "Avis de l'Office National des Forêts", statutIds: defaultStatutIds },
  expertiseOfficeNationalDesForets: { id: 'expertiseOfficeNationalDesForets', nom: "Expertise de l'Office National des Forêts", statutIds: defaultStatutIds },
  avisInstitutNationalOrigineQualite: { id: 'avisInstitutNationalOrigineQualite', nom: "Avis de l'Institut National de l'origine et de la Qualité", statutIds: defaultStatutIds },
  avisEtatMajorOrpaillagePecheIllicite: { id: 'avisEtatMajorOrpaillagePecheIllicite', nom: "Avis de l'État-major Orpaillage et Pêche Illicite (EMOPI)", statutIds: defaultStatutIds },
  avisServiceAdministratifLocal: { id: 'avisServiceAdministratifLocal', nom: "Avis d'un Service Administratif Local", statutIds: defaultStatutIds },
  avisAutoriteMilitaire: { id: 'avisAutoriteMilitaire', nom: "Avis de l'Autorité militaire", statutIds: defaultStatutIds },
  avisParcNational: { id: 'avisParcNational', nom: 'Avis du Parc National', statutIds: defaultStatutIds },
  avisDirectionDepartementaleTerritoiresMer: {
    id: 'avisDirectionDepartementaleTerritoiresMer',
    nom: 'Avis de la Direction Départementale des Territoires et de la Mer (DDTM)',
    statutIds: defaultStatutIds,
  },
  avisAgenceRegionaleSante: { id: 'avisAgenceRegionaleSante', nom: "Avis de l'Agence Régionale de Santé (ARS)", statutIds: defaultStatutIds },
  avisCaisseGeneraleSecuriteSociale: { id: 'avisCaisseGeneraleSecuriteSociale', nom: 'Avis de la Caisse Générale de Sécurité Sociale', statutIds: defaultStatutIds },
  avisDUneCollectivite: { id: 'avisDUneCollectivite', nom: "Avis d'une collectivité", statutIds: defaultStatutIds },
  avisDeLaMissionAutoriteEnvironnementale: { id: 'avisDeLaMissionAutoriteEnvironnementale', nom: 'avis de la mission autorité environnementale', statutIds: ['Exempté', 'Requis'] },
  avisProprietaireDuSol: { id: 'avisProprietaireDuSol', nom: 'avis du propriétaire du sol', statutIds: defaultStatutIds },
  avisCasParCas: { id: 'avisCasParCas', nom: 'Décision au cas par cas', statutIds: ['Exempté', 'Requis'] },
  avisDuConseilGeneralDeLEconomie: { id: 'avisDuConseilGeneralDeLEconomie', nom: "Avis du conseil général de l'économie (CGE)", statutIds: defaultStatutIds },
  autreAvis: { id: 'autreAvis', nom: 'Autre avis', statutIds: defaultStatutIds },
} as const satisfies { [key in AvisTypeId]: Definition<key> }

const nonRenseigneAvis: NonEmptyArray<AvisStatutId> = ['Non renseigné']
export const getAvisNom = (id: AvisTypeId): string => AvisTypes[id].nom
export const getAvisStatut = (id: AvisTypeId | null, required: boolean): NonEmptyArray<AvisStatutId> => {
  if (isNullOrUndefined(id)) {
    return nonRenseigneAvis
  }
  const statutIds = AvisTypes[id].statutIds
  const removeNonRenseigneIfRequired = statutIds.filter(id => !required || id !== 'Non renseigné')

  /* v8 ignore next */
  return isNonEmptyArray(removeNonRenseigneIfRequired) ? removeNonRenseigneIfRequired : nonRenseigneAvis
}
// prettier-ignore
const AvisStatutIds = [
  "Favorable",
  "Défavorable",
  "Favorable avec réserves",
  "Non renseigné",
  'Exempté',
  "Requis"
] as const

export const AVIS_STATUTS = {
  Favorable: 'Favorable',
  Défavorable: 'Défavorable',
  ['Favorable avec réserves']: 'Favorable avec réserves',
  ['Non renseigné']: 'Non renseigné',
  Exempté: 'Exempté',
  Requis: 'Requis',
} as const satisfies { [key in AvisStatutId]: key }

export const avisStatutIdValidator = z.enum(AvisStatutIds)
export type AvisStatutId = z.infer<typeof avisStatutIdValidator>

export const AVIS_VISIBILITY_IDS = ['Public', 'TitulairesEtAdministrations', 'Administrations'] as const

export const avisVisibilityIdValidator = z.enum(AVIS_VISIBILITY_IDS)
export type AvisVisibilityId = z.infer<typeof avisVisibilityIdValidator>

export const AvisVisibilityIds = {
  Public: 'Public',
  TitulairesEtAdministrations: 'TitulairesEtAdministrations',
  Administrations: 'Administrations',
} as const satisfies Record<(typeof AVIS_VISIBILITY_IDS)[number], AvisVisibilityId>
