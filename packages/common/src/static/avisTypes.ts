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
const AVIS_TYPES_IDS = ['lettreDeSaisineDesServices', 'confirmationAccordProprietaireDuSol', 'avisDirectionRegionaleDesAffairesCulturelles', 'avisDirectionAlimentationAgricultureForet', 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques', 'avisDirectionsRégionalesEconomieEmploiTravailSolidarités', 'avisDirectionRegionaleFinancesPubliques', 'avisGendarmerieNationale', 'avisParcNaturelMarin', 'avisIFREMER', 'avisInstitutNationalOrigineQualite', 'avisEtatMajorOrpaillagePecheIllicite', 'avisServiceAdministratifLocal', 'avisAutoriteMilitaire', 'avisParcNational', 'avisDirectionDepartementaleTerritoiresMer', 'avisAgenceRegionaleSante', 'avisPrefetMaritime', 'avisCaisseGeneraleSecuriteSociale', 'autreAvis'] as const


export const avisTypeIdValidator = z.enum(AVIS_TYPES_IDS)
export type AvisTypeId = z.infer<typeof avisTypeIdValidator>

export const AvisTypes: { [key in AvisTypeId]: Definition<key> } = {
  lettreDeSaisineDesServices: { id: 'lettreDeSaisineDesServices', nom: "Lettre de saisine des services" },
  confirmationAccordProprietaireDuSol: { id: 'confirmationAccordProprietaireDuSol', nom: "Confirmation de l'accord du propriétaire du sol" },
  avisDirectionRegionaleDesAffairesCulturelles: { id: 'avisDirectionRegionaleDesAffairesCulturelles', nom: "Avis de la Direction Regionale Des Affaires Culturelles (DRAC)"},
  avisDirectionAlimentationAgricultureForet: { id: 'avisDirectionAlimentationAgricultureForet', nom: "avis de la Direction de l'Alimentation de l'Agriculture et de la Foret (DRAF)"},
  avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques: { id: 'avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques', nom: "avis du Conseil Departemental de l'Environnement et des Risques Sanitaires et Technologiques (CODERST)"},
  avisDirectionsRégionalesEconomieEmploiTravailSolidarités: { id: 'avisDirectionsRégionalesEconomieEmploiTravailSolidarités', nom: "avis de la Directions régionales de l’économie, de l’emploi, du travail et des solidarités"},
  avisDirectionRegionaleFinancesPubliques: { id: 'avisDirectionRegionaleFinancesPubliques', nom: "avis de la Direction Regionale Des Finances Publiques"},
  avisGendarmerieNationale: { id: 'avisGendarmerieNationale', nom: "avis de la Gendarmerie Nationale"},
  avisParcNaturelMarin: { id: 'avisParcNaturelMarin', nom: "avis du Parc Naturel Marin"},
  avisIFREMER: { id: 'avisIFREMER', nom: "avis de l'IFREMER"},
  avisInstitutNationalOrigineQualite: { id: 'avisInstitutNationalOrigineQualite', nom: "avis de l'Institut National de l'origine et de la Qualite"},
  avisEtatMajorOrpaillagePecheIllicite: { id: 'avisEtatMajorOrpaillagePecheIllicite', nom: "avis de l'Etat-major Orpaillage et Peche Illicite (EMOPI)"},
  avisServiceAdministratifLocal: { id: 'avisServiceAdministratifLocal', nom: "avis d'un Service Administratif Local"},
  avisAutoriteMilitaire: { id: 'avisAutoriteMilitaire', nom: "avis de l'Autorite militaire"},
  avisParcNational: { id: 'avisParcNational', nom: "avis du Parc National"},
  avisDirectionDepartementaleTerritoiresMer: { id: 'avisDirectionDepartementaleTerritoiresMer', nom: "avis de la Direction Departementale des Territoires et de la Mer (DDTM)"},
  avisAgenceRegionaleSante: { id: 'avisAgenceRegionaleSante', nom: "avis de l'Agence Regionale de Sante (ARS)"},
  avisPrefetMaritime: { id: 'avisPrefetMaritime', nom: "avis du préfet maritime"},
  avisCaisseGeneraleSecuriteSociale: { id: 'avisCaisseGeneraleSecuriteSociale', nom: "avis de la Caisse Generale de Securite Sociale"},
  autreAvis: { id: 'autreAvis', nom: "Autre avis"},
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