import { z } from 'zod'

interface Definition<T> {
  id: T
  nom: string
}
// prettier-ignore
const AVIS_TYPES_IDS = [ 'confirmationAccordProprietaireDuSol', 'avisDirectionRegionaleDesAffairesCulturelles', 'avisDirectionAlimentationAgricultureForet', 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques', 'avisDirectionsRégionalesEconomieEmploiTravailSolidarités', 'avisDirectionRegionaleFinancesPubliques', 'avisGendarmerieNationale', 'avisParcNaturelMarin', 'avisIFREMER', 'avisInstitutNationalOrigineQualite', 'avisEtatMajorOrpaillagePecheIllicite', 'avisServiceAdministratifLocal', 'avisAutoriteMilitaire', 'avisParcNational', 'avisDirectionDepartementaleTerritoiresMer', 'avisAgenceRegionaleSante', 'avisCaisseGeneraleSecuriteSociale', 'autreAvis', 'avisServiceMilieuxNaturelsBiodiversiteSitesPaysages', 'avisOfficeNationalDesForets', 'expertiseOfficeNationalDesForets', 'avisDUneCollectivite','avisDuPrefetMaritime_wap','consultationCLEDuSAGE'] as const

export const avisTypeIdValidator = z.enum(AVIS_TYPES_IDS)
export type AvisTypeId = z.infer<typeof avisTypeIdValidator>

export const AvisTypes: { [key in AvisTypeId]: Definition<key> } = {
  confirmationAccordProprietaireDuSol: { id: 'confirmationAccordProprietaireDuSol', nom: "Confirmation de l'accord du propriétaire du sol" },
  avisDirectionRegionaleDesAffairesCulturelles: { id: 'avisDirectionRegionaleDesAffairesCulturelles', nom: 'Avis de la Direction Régionale Des Affaires Culturelles (DRAC)' },
  avisDirectionAlimentationAgricultureForet: { id: 'avisDirectionAlimentationAgricultureForet', nom: "Avis de la Direction de l'Alimentation de l'Agriculture et de la Forêt (DRAF)" },
  avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques: {
    id: 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques',
    nom: "Avis du Conseil Départemental de l'Environnement et des Risques Sanitaires et Technologiques (CODERST)",
  },
  avisServiceMilieuxNaturelsBiodiversiteSitesPaysages: {
    id: 'avisServiceMilieuxNaturelsBiodiversiteSitesPaysages',
    nom: 'Avis du Service Milieux Naturels Biodiversité Sites Et Paysages (MNBST) de la DGTM',
  },
  avisDirectionsRégionalesEconomieEmploiTravailSolidarités: {
    id: 'avisDirectionsRégionalesEconomieEmploiTravailSolidarités',
    nom: 'Avis de la Direction régionale de l’économie, de l’emploi, du travail et des solidarités',
  },
  avisDirectionRegionaleFinancesPubliques: { id: 'avisDirectionRegionaleFinancesPubliques', nom: 'Avis de la Direction Regionale Des Finances Publiques' },
  avisGendarmerieNationale: { id: 'avisGendarmerieNationale', nom: 'Avis de la Gendarmerie Nationale' },
  avisParcNaturelMarin: { id: 'avisParcNaturelMarin', nom: 'Avis du Parc Naturel Marin' },
  avisIFREMER: { id: 'avisIFREMER', nom: "Avis de l'IFREMER" },
  avisOfficeNationalDesForets: { id: 'avisOfficeNationalDesForets', nom: "Avis de l'Office National des Forêts" },
  expertiseOfficeNationalDesForets: { id: 'expertiseOfficeNationalDesForets', nom: "Expertise de l'Office National des Forêts" },
  avisInstitutNationalOrigineQualite: { id: 'avisInstitutNationalOrigineQualite', nom: "Avis de l'Institut National de l'origine et de la Qualité" },
  avisEtatMajorOrpaillagePecheIllicite: { id: 'avisEtatMajorOrpaillagePecheIllicite', nom: "Avis de l'État-major Orpaillage et Pêche Illicite (EMOPI)" },
  avisServiceAdministratifLocal: { id: 'avisServiceAdministratifLocal', nom: "Avis d'un Service Administratif Local" },
  avisAutoriteMilitaire: { id: 'avisAutoriteMilitaire', nom: "Avis de l'Autorité militaire" },
  avisParcNational: { id: 'avisParcNational', nom: 'Avis du Parc National' },
  avisDirectionDepartementaleTerritoiresMer: { id: 'avisDirectionDepartementaleTerritoiresMer', nom: 'Avis de la Direction Départementale des Territoires et de la Mer (DDTM)' },
  avisAgenceRegionaleSante: { id: 'avisAgenceRegionaleSante', nom: "Avis de l'Agence Régionale de Santé (ARS)" },
  avisCaisseGeneraleSecuriteSociale: { id: 'avisCaisseGeneraleSecuriteSociale', nom: 'Avis de la Caisse Générale de Sécurité Sociale' },
  avisDUneCollectivite: { id: 'avisDUneCollectivite', nom: "Avis d'une collectivité" },
  autreAvis: { id: 'autreAvis', nom: 'Autre avis' },
  avisDuPrefetMaritime_wap: { id: 'avisDuPrefetMaritime_wap', nom: 'Avis du préfet maritime' },
  consultationCLEDuSAGE: { id: 'consultationCLEDuSAGE', nom: 'Consultation CLE du SAGE' },
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
