import { z } from 'zod'

export interface AvisType {
  id: AvisTypeId
  nom: string
}

interface Definition<T> {
  id: T
  nom: string
}
// prettier-ignore
const AVIS_TYPES_IDS = ['lettreDeSaisineDesServices', 'confirmationAccordProprietaireDuSol', 'avisDirectionRegionaleDesAffairesCulturelles', 'avisDirectionAlimentationAgricultureForet', 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques', 'avisDirectionsRégionalesEconomieEmploiTravailSolidarités', 'avisDirectionRegionaleFinancesPubliques', 'avisGendarmerieNationale', 'avisParcNaturelMarin', 'avisIFREMER', 'avisInstitutNationalOrigineQualite', 'avisEtatMajorOrpaillagePecheIllicite', 'avisServiceAdministratifLocal', 'avisAutoriteMilitaire', 'avisParcNational', 'avisDirectionDepartementaleTerritoiresMer', 'avisAgenceRegionaleSante', 'avisCaisseGeneraleSecuriteSociale', 'autreAvis', 'avisServiceMilieuxNaturelsBiodiversiteSitesPaysages', 'avisOfficeNationalDesForets', 'expertiseOfficeNationalDesForets'] as const

export const avisTypeIdValidator = z.enum(AVIS_TYPES_IDS)
export type AvisTypeId = z.infer<typeof avisTypeIdValidator>

export const AvisTypes: { [key in AvisTypeId]: Definition<key> } = {
  lettreDeSaisineDesServices: { id: 'lettreDeSaisineDesServices', nom: 'Lettre de saisine des services' },
  confirmationAccordProprietaireDuSol: { id: 'confirmationAccordProprietaireDuSol', nom: "Confirmation de l'accord du propriétaire du sol" },
  avisDirectionRegionaleDesAffairesCulturelles: { id: 'avisDirectionRegionaleDesAffairesCulturelles', nom: 'Avis de la Direction Régionale Des Affaires Culturelles (DRAC)' },
  avisDirectionAlimentationAgricultureForet: { id: 'avisDirectionAlimentationAgricultureForet', nom: "avis de la Direction de l'Alimentation de l'Agriculture et de la Forêt (DRAF)" },
  avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques: {
    id: 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques',
    nom: "avis du Conseil Départemental de l'Environnement et des Risques Sanitaires et Technologiques (CODERST)",
  },
  avisServiceMilieuxNaturelsBiodiversiteSitesPaysages: {
    id: 'avisServiceMilieuxNaturelsBiodiversiteSitesPaysages',
    nom: 'avis du Service Milieux Naturels Biodiversité Sites Et Paysages (MNBST) de la DGTM',
  },
  avisDirectionsRégionalesEconomieEmploiTravailSolidarités: {
    id: 'avisDirectionsRégionalesEconomieEmploiTravailSolidarités',
    nom: 'avis de la Direction régionale de l’économie, de l’emploi, du travail et des solidarités',
  },
  avisDirectionRegionaleFinancesPubliques: { id: 'avisDirectionRegionaleFinancesPubliques', nom: 'avis de la Direction Regionale Des Finances Publiques' },
  avisGendarmerieNationale: { id: 'avisGendarmerieNationale', nom: 'avis de la Gendarmerie Nationale' },
  avisParcNaturelMarin: { id: 'avisParcNaturelMarin', nom: 'avis du Parc Naturel Marin' },
  avisIFREMER: { id: 'avisIFREMER', nom: "avis de l'IFREMER" },
  avisOfficeNationalDesForets: { id: 'avisOfficeNationalDesForets', nom: "avis de l'Office National des Forêts" },
  expertiseOfficeNationalDesForets: { id: 'expertiseOfficeNationalDesForets', nom: "expertise de l'Office National des Forêts" },
  avisInstitutNationalOrigineQualite: { id: 'avisInstitutNationalOrigineQualite', nom: "avis de l'Institut National de l'origine et de la Qualité" },
  avisEtatMajorOrpaillagePecheIllicite: { id: 'avisEtatMajorOrpaillagePecheIllicite', nom: "avis de l'État-major Orpaillage et Pêche Illicite (EMOPI)" },
  avisServiceAdministratifLocal: { id: 'avisServiceAdministratifLocal', nom: "avis d'un Service Administratif Local" },
  avisAutoriteMilitaire: { id: 'avisAutoriteMilitaire', nom: "avis de l'Autorité militaire" },
  avisParcNational: { id: 'avisParcNational', nom: 'avis du Parc National' },
  avisDirectionDepartementaleTerritoiresMer: { id: 'avisDirectionDepartementaleTerritoiresMer', nom: 'avis de la Direction Départementale des Territoires et de la Mer (DDTM)' },
  avisAgenceRegionaleSante: { id: 'avisAgenceRegionaleSante', nom: "avis de l'Agence Régionale de Santé (ARS)" },
  avisCaisseGeneraleSecuriteSociale: { id: 'avisCaisseGeneraleSecuriteSociale', nom: 'avis de la Caisse Générale de Sécurité Sociale' },
  autreAvis: { id: 'autreAvis', nom: 'Autre avis' },
}

// prettier-ignore
export const AvisStatutIds = [
  "Favorable",
  "Défavorable",
  "Favorable avec réserves",
  "Non renseigné",
] as const

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
