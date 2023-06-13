import { EtapesStatuts, EtapeStatut, EtapeStatutId, ETAPES_STATUTS } from './etapesStatuts.js'
import { ETAPES_TYPES, EtapeTypeId } from './etapesTypes.js'

export interface EtapeTypeEtapeStatut<T extends EtapeTypeId, R extends EtapeStatutId> {
  etapeStatutId: R
  etapeTypeId: T
  ordre: number
}

export const EtapesTypesEtapesStatuts = {
  avisDeDirectionRegionaleDesAffairesCulturelles: {
    DEFAVORABLE: { etapeTypeId: 'aac', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aac', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'aac', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aac', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet: {
    DEFAVORABLE: { etapeTypeId: 'aaf', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aaf', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'aaf', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aaf', etapeStatutId: 'fre', ordre: 2 },
  },
  abrogationDeLaDecision: { FAIT: { etapeTypeId: 'abd', etapeStatutId: 'fai', ordre: 1 } },
  avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_: {
    DEFAVORABLE: { etapeTypeId: 'abs', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'abs', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'abs', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'abs', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_: {
    AJOURNE: { etapeTypeId: 'aca', etapeStatutId: 'ajo', ordre: 3 },
    DEFAVORABLE: { etapeTypeId: 'aca', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'aca', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst_: {
    DEFAVORABLE: { etapeTypeId: 'acd', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'acd', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'acd', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'acd', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDuConseilGeneralDeLeconomie_CGE_: {
    DEFAVORABLE: { etapeTypeId: 'acg', etapeStatutId: 'def', ordre: 2 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'acg', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'acg', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'acg', etapeStatutId: 'fre', ordre: 3 },
  },
  avisDuneCollectiviteLocale: {
    DEFAVORABLE: { etapeTypeId: 'acl', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'acl', etapeStatutId: 'fav', ordre: 1 },
  },
  avenantALautorisationDeRechercheMiniere: { FAIT: { etapeTypeId: 'aco', etapeStatutId: 'fai', ordre: 1 } },
  avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi: {
    DEFAVORABLE: { etapeTypeId: 'aec', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aec', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'aec', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aec', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDunPresidentDEPCI: {
    DEFAVORABLE: { etapeTypeId: 'aep', etapeStatutId: 'def', ordre: 2 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aep', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'aep', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aep', etapeStatutId: 'fre', ordre: 3 },
  },
  avisDeLaDirectionRegionaleDesFinancesPubliques: {
    DEFAVORABLE: { etapeTypeId: 'afp', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'afp', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'afp', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'afp', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDeLaGendarmerieNationale: {
    DEFAVORABLE: { etapeTypeId: 'agn', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'agn', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'agn', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'agn', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDeLIfremer: {
    DEFAVORABLE: { etapeTypeId: 'aim', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aim', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'aim', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aim', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDunMaire: {
    DEFAVORABLE: { etapeTypeId: 'ama', etapeStatutId: 'def', ordre: 2 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ama', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'ama', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ama', etapeStatutId: 'fre', ordre: 3 },
  },
  avisDuParcNaturelMarin: {
    DEFAVORABLE: { etapeTypeId: 'ami', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ami', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'ami', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ami', etapeStatutId: 'fre', ordre: 2 },
  },
  decisionDuJugeAdministratif: {
    ACCEPTE: { etapeTypeId: 'and', etapeStatutId: 'acc', ordre: 2 },
    FAIT: { etapeTypeId: 'and', etapeStatutId: 'fai', ordre: 1 },
    REJETE: { etapeTypeId: 'and', etapeStatutId: 'rej', ordre: 3 },
  },
  avisDeMiseEnConcurrenceAuJOUE: {
    EN_COURS: { etapeTypeId: 'ane', etapeStatutId: 'enc', ordre: 2 },
    FAIT: { etapeTypeId: 'ane', etapeStatutId: 'fai', ordre: 4 },
    PROGRAMME: { etapeTypeId: 'ane', etapeStatutId: 'pro', ordre: 1 },
    TERMINE: { etapeTypeId: 'ane', etapeStatutId: 'ter', ordre: 3 },
  },
  avisDeMiseEnConcurrenceAuJORF: {
    EN_COURS: { etapeTypeId: 'anf', etapeStatutId: 'enc', ordre: 2 },
    FAIT: { etapeTypeId: 'anf', etapeStatutId: 'fai', ordre: 4 },
    PROGRAMME: { etapeTypeId: 'anf', etapeStatutId: 'pro', ordre: 1 },
    TERMINE: { etapeTypeId: 'anf', etapeStatutId: 'ter', ordre: 3 },
  },
  avisDeLOfficeNationalDesForets: {
    DEFAVORABLE: { etapeTypeId: 'aof', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aof', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'aof', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aof', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDeLInstitutNationalDeLorigineEtDeLaQualite: {
    DEFAVORABLE: { etapeTypeId: 'aop', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'aop', etapeStatutId: 'fav', ordre: 1 },
  },
  avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement: {
    DEFAVORABLE: { etapeTypeId: 'apd', etapeStatutId: 'def', ordre: 2 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apd', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'apd', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apd', etapeStatutId: 'fre', ordre: 3 },
  },
  avisDuConseilDEtat: {
    DEFAVORABLE: { etapeTypeId: 'ape', etapeStatutId: 'def', ordre: 2 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ape', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'ape', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ape', etapeStatutId: 'fre', ordre: 3 },
  },
  avisDeLetatMajorOrpaillageEtPecheIllicite_EMOPI_: {
    DEFAVORABLE: { etapeTypeId: 'api', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'api', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'api', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'api', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDunServiceAdministratifLocal: {
    DEFAVORABLE: { etapeTypeId: 'apl', etapeStatutId: 'def', ordre: 2 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apl', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'apl', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apl', etapeStatutId: 'fre', ordre: 3 },
  },
  avisDeLautoriteMilitaire: {
    DEFAVORABLE: { etapeTypeId: 'apm', etapeStatutId: 'def', ordre: 2 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apm', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'apm', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apm', etapeStatutId: 'fre', ordre: 3 },
  },
  avisDuParcNational: {
    DEFAVORABLE: { etapeTypeId: 'apn', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'apn', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDeLaCommissionDepartementaleDesMines_CDM_: {
    AJOURNE: { etapeTypeId: 'apo', etapeStatutId: 'ajo', ordre: 1 },
    DEFAVORABLE: { etapeTypeId: 'apo', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apo', etapeStatutId: 'dre', ordre: 5 },
    FAVORABLE: { etapeTypeId: 'apo', etapeStatutId: 'fav', ordre: 2 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apo', etapeStatutId: 'fre', ordre: 4 },
  },
  avisDuPrefet: {
    DEFAVORABLE: { etapeTypeId: 'app', etapeStatutId: 'def', ordre: 2 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'app', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'app', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'app', etapeStatutId: 'fre', ordre: 3 },
  },
  publicationDeLavisDeDecisionImplicite: {
    ACCEPTE: { etapeTypeId: 'apu', etapeStatutId: 'acc', ordre: 2 },
    FAIT: { etapeTypeId: 'apu', etapeStatutId: 'fai', ordre: 1 },
    REJETE: { etapeTypeId: 'apu', etapeStatutId: 'rej', ordre: 3 },
  },
  avisDuPrefetMaritime: {
    DEFAVORABLE: { etapeTypeId: 'apw', etapeStatutId: 'def', ordre: 2 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apw', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'apw', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apw', etapeStatutId: 'fre', ordre: 3 },
  },
  avisDeLaReunionInterservice: {
    DEFAVORABLE: { etapeTypeId: 'ari', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'ari', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDeLagenceRegionaleDeSante: {
    DEFAVORABLE: { etapeTypeId: 'ars', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ars', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'ars', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ars', etapeStatutId: 'fre', ordre: 2 },
  },
  decisionDuProprietaireDuSol: {
    DEFAVORABLE: { etapeTypeId: 'asl', etapeStatutId: 'def', ordre: 3 },
    FAVORABLE: { etapeTypeId: 'asl', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'asl', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDeLaCaisseGeneraleDeSecuriteSociale: {
    DEFAVORABLE: { etapeTypeId: 'ass', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ass', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'ass', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ass', etapeStatutId: 'fre', ordre: 2 },
  },
  avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_: {
    DEFAVORABLE: { etapeTypeId: 'auc', etapeStatutId: 'def', ordre: 3 },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'auc', etapeStatutId: 'dre', ordre: 4 },
    FAVORABLE: { etapeTypeId: 'auc', etapeStatutId: 'fav', ordre: 1 },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'auc', etapeStatutId: 'fre', ordre: 2 },
  },
  consultationDesAdministrationsCentrales: { FAIT: { etapeTypeId: 'cac', etapeStatutId: 'fai', ordre: 1 } },
  concertationInterministerielle: { FAIT: { etapeTypeId: 'cim', etapeStatutId: 'fai', ordre: 1 } },
  saisineDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst_: { FAIT: { etapeTypeId: 'cod', etapeStatutId: 'fai', ordre: 1 } },
  confirmationDeLaccordDuProprietaireDuSol: {
    DEFAVORABLE: { etapeTypeId: 'cps', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'cps', etapeStatutId: 'fav', ordre: 1 },
  },
  classementSansSuite: { FAIT: { etapeTypeId: 'css', etapeStatutId: 'fai', ordre: 1 } },
  decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: {
    EXEMPTE: { etapeTypeId: 'dae', etapeStatutId: 'exe', ordre: 1 },
    REQUIS: { etapeTypeId: 'dae', etapeStatutId: 'req', ordre: 2 },
  },
  declaration: { FAIT: { etapeTypeId: 'dec', etapeStatutId: 'fai', ordre: 1 } },
  decisionDeLOfficeNationalDesForets: {
    ACCEPTE: { etapeTypeId: 'def', etapeStatutId: 'acc', ordre: 1 },
    REJETE: { etapeTypeId: 'def', etapeStatutId: 'rej', ordre: 2 },
  },
  desistementDuDemandeur: { FAIT: { etapeTypeId: 'des', etapeStatutId: 'fai', ordre: 1 } },
  decisionDeLadministration: {
    ACCEPTE: { etapeTypeId: 'dex', etapeStatutId: 'acc', ordre: 1 },
    REJETE: { etapeTypeId: 'dex', etapeStatutId: 'rej', ordre: 2 },
  },
  decisionImplicite: {
    ACCEPTE: { etapeTypeId: 'dim', etapeStatutId: 'acc', ordre: 1 },
    REJETE: { etapeTypeId: 'dim', etapeStatutId: 'rej', ordre: 2 },
  },
  publicationDeDecisionAuJORF: {
    ACCEPTE: { etapeTypeId: 'dpu', etapeStatutId: 'acc', ordre: 1 },
    REJETE: { etapeTypeId: 'dpu', etapeStatutId: 'rej', ordre: 2 },
  },
  publicationDeDecisionAdministrativeAuJORF: { FAIT: { etapeTypeId: 'dup', etapeStatutId: 'fai', ordre: 1 } },
  decisionAdministrative: { FAIT: { etapeTypeId: 'dux', etapeStatutId: 'fai', ordre: 1 } },
  expertiseDREALOuDGTMServiceEau: {
    DEFAVORABLE: { etapeTypeId: 'ede', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'ede', etapeStatutId: 'fav', ordre: 1 },
  },
  expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_: {
    DEFAVORABLE: { etapeTypeId: 'edm', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'edm', etapeStatutId: 'fav', ordre: 1 },
  },
  expertiseDeLOfficeNationalDesForets: { FAIT: { etapeTypeId: 'eof', etapeStatutId: 'fai', ordre: 1 } },
  clotureDeLenquetePublique: { TERMINE: { etapeTypeId: 'epc', etapeStatutId: 'ter', ordre: 1 } },
  ouvertureDeLenquetePublique: {
    FAIT: { etapeTypeId: 'epu', etapeStatutId: 'fai', ordre: 2 },
    PROGRAMME: { etapeTypeId: 'epu', etapeStatutId: 'pro', ordre: 1 },
  },
  expertiseDREALOuDGTMServiceBiodiversite: { FAIT: { etapeTypeId: 'esb', etapeStatutId: 'fai', ordre: 1 } },
  initiationDeLaDemarcheDeRetrait: { FAIT: { etapeTypeId: 'ide', etapeStatutId: 'fai', ordre: 1 } },
  informationsHistoriquesIncompletes: { FAIT: { etapeTypeId: 'ihi', etapeStatutId: 'fai', ordre: 1 } },
  demandeDeComplements_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'mca', etapeStatutId: 'fai', ordre: 1 } },
  demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_: { FAIT: { etapeTypeId: 'mcb', etapeStatutId: 'fai', ordre: 1 } },
  demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: { FAIT: { etapeTypeId: 'mcd', etapeStatutId: 'fai', ordre: 1 } },
  demandeDeComplements_CompletudeDeLaDemande_: { FAIT: { etapeTypeId: 'mcm', etapeStatutId: 'fai', ordre: 1 } },
  demandeDeComplements: { FAIT: { etapeTypeId: 'mco', etapeStatutId: 'fai', ordre: 1 } },
  completudeDeLaDemande: {
    COMPLETE: { etapeTypeId: 'mcp', etapeStatutId: 'com', ordre: 1 },
    INCOMPLETE: { etapeTypeId: 'mcp', etapeStatutId: 'inc', ordre: 2 },
  },
  recevabiliteDeLaDemande: {
    DEFAVORABLE: { etapeTypeId: 'mcr', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'mcr', etapeStatutId: 'fav', ordre: 1 },
  },
  demandeDeComplements_SaisineDeLaCARM_: { FAIT: { etapeTypeId: 'mcs', etapeStatutId: 'fai', ordre: 1 } },
  depotDeLaDemande: { FAIT: { etapeTypeId: 'mdp', etapeStatutId: 'fai', ordre: 1 } },
  avisDeDemandeConcurrente: { FAIT: { etapeTypeId: 'mec', etapeStatutId: 'fai', ordre: 1 } },
  enregistrementDeLaDemande: { FAIT: { etapeTypeId: 'men', etapeStatutId: 'fai', ordre: 1 } },
  priseEnChargeParLOfficeNationalDesForets: { FAIT: { etapeTypeId: 'meo', etapeStatutId: 'fai', ordre: 1 } },
  demande: {
    EN_CONSTRUCTION: { etapeTypeId: 'mfr', etapeStatutId: 'aco', ordre: 1 },
    FAIT: { etapeTypeId: 'mfr', etapeStatutId: 'fai', ordre: 2 },
  },
  demandeDinformations_AvisDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'mia', etapeStatutId: 'fai', ordre: 1 } },
  demandeDinformations_AvisDuDREALDEALOuDGTM_: { FAIT: { etapeTypeId: 'mie', etapeStatutId: 'fai', ordre: 1 } },
  demandeDinformations: { FAIT: { etapeTypeId: 'mif', etapeStatutId: 'fai', ordre: 1 } },
  demandeDinformations_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'mim', etapeStatutId: 'fai', ordre: 1 } },
  demandeDinformations_ExpertiseDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'mio', etapeStatutId: 'fai', ordre: 1 } },
  notificationAuDemandeur_AjournementDeLaCARM_: { FAIT: { etapeTypeId: 'mna', etapeStatutId: 'fai', ordre: 1 } },
  notificationAuDemandeur_AvisFavorableDeLaCARM_: { FAIT: { etapeTypeId: 'mnb', etapeStatutId: 'fai', ordre: 1 } },
  notificationAuDemandeur_ClassementSansSuite_: { FAIT: { etapeTypeId: 'mnc', etapeStatutId: 'fai', ordre: 1 } },
  notificationAuDemandeur_AvisDefavorable_: { FAIT: { etapeTypeId: 'mnd', etapeStatutId: 'fai', ordre: 1 } },
  notificationAuDemandeur_InitiationDeLaDemarcheDeRetrait_: { FAIT: { etapeTypeId: 'mni', etapeStatutId: 'fai', ordre: 1 } },
  notificationAuDemandeur: { FAIT: { etapeTypeId: 'mno', etapeStatutId: 'fai', ordre: 1 } },
  notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_: { FAIT: { etapeTypeId: 'mns', etapeStatutId: 'fai', ordre: 1 } },
  notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_: { FAIT: { etapeTypeId: 'mnv', etapeStatutId: 'fai', ordre: 1 } },
  modificationDeLaDemande: { FAIT: { etapeTypeId: 'mod', etapeStatutId: 'fai', ordre: 1 } },
  modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: { FAIT: { etapeTypeId: 'mom', etapeStatutId: 'fai', ordre: 1 } },
  notificationDesCollectivitesLocales: { FAIT: { etapeTypeId: 'ncl', etapeStatutId: 'fai', ordre: 1 } },
  noteInterneSignalee: { FAIT: { etapeTypeId: 'nis', etapeStatutId: 'fai', ordre: 1 } },
  notificationAuPrefet: { FAIT: { etapeTypeId: 'npp', etapeStatutId: 'fai', ordre: 1 } },
  paiementDesFraisDeDossierComplementaires: { FAIT: { etapeTypeId: 'pfc', etapeStatutId: 'fai', ordre: 1 } },
  paiementDesFraisDeDossier: { FAIT: { etapeTypeId: 'pfd', etapeStatutId: 'fai', ordre: 1 } },
  avisDuParcNaturelRegional: {
    DEFAVORABLE: { etapeTypeId: 'pnr', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'pnr', etapeStatutId: 'fav', ordre: 1 },
  },
  clotureDeLaParticipationDuPublic: { TERMINE: { etapeTypeId: 'ppc', etapeStatutId: 'ter', ordre: 1 } },
  ouvertureDeLaParticipationDuPublic: {
    FAIT: { etapeTypeId: 'ppu', etapeStatutId: 'fai', ordre: 2 },
    PROGRAMME: { etapeTypeId: 'ppu', etapeStatutId: 'pro', ordre: 1 },
  },
  publicationDansUnJournalLocalOuNational: { FAIT: { etapeTypeId: 'pqr', etapeStatutId: 'fai', ordre: 1 } },
  receptionDeComplements_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'rca', etapeStatutId: 'fai', ordre: 1 } },
  receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_: { FAIT: { etapeTypeId: 'rcb', etapeStatutId: 'fai', ordre: 1 } },
  receptionDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet__: { FAIT: { etapeTypeId: 'rcd', etapeStatutId: 'fai', ordre: 1 } },
  rapportDuConseilGeneralDeLeconomie_CGE_: {
    DEFAVORABLE: { etapeTypeId: 'rcg', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'rcg', etapeStatutId: 'fav', ordre: 1 },
  },
  receptionDeComplements_CompletudeDeLaDemande_: { FAIT: { etapeTypeId: 'rcm', etapeStatutId: 'fai', ordre: 1 } },
  receptionDeComplements: { FAIT: { etapeTypeId: 'rco', etapeStatutId: 'fai', ordre: 1 } },
  receptionDeComplements_SaisineDeLaCARM_: { FAIT: { etapeTypeId: 'rcs', etapeStatutId: 'fai', ordre: 1 } },
  recepisseDeDeclarationLoiSurLeau: {
    DEFAVORABLE: { etapeTypeId: 'rde', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'rde', etapeStatutId: 'fav', ordre: 1 },
  },
  receptionDinformation_AvisDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'ria', etapeStatutId: 'fai', ordre: 1 } },
  receptionDinformation_AvisDuDREALDEALOuDGTM_: { FAIT: { etapeTypeId: 'rie', etapeStatutId: 'fai', ordre: 1 } },
  receptionDinformation: { FAIT: { etapeTypeId: 'rif', etapeStatutId: 'fai', ordre: 1 } },
  receptionDinformation_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'rim', etapeStatutId: 'fai', ordre: 1 } },
  receptionDinformation_ExpertiseDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'rio', etapeStatutId: 'fai', ordre: 1 } },
  rapportDuConseilDEtat: {
    DEFAVORABLE: { etapeTypeId: 'rpe', etapeStatutId: 'def', ordre: 2 },
    FAVORABLE: { etapeTypeId: 'rpe', etapeStatutId: 'fav', ordre: 1 },
  },
  publicationDeDecisionAuRecueilDesActesAdministratifs: { FAIT: { etapeTypeId: 'rpu', etapeStatutId: 'fai', ordre: 3 } },
  retraitDeLaDecision: { FAIT: { etapeTypeId: 'rtd', etapeStatutId: 'fai', ordre: 1 } },
  saisineDeLautoriteSignataire: { FAIT: { etapeTypeId: 'sas', etapeStatutId: 'fai', ordre: 1 } },
  saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_: { FAIT: { etapeTypeId: 'sca', etapeStatutId: 'fai', ordre: 1 } },
  saisineDuConseilGeneralDeLeconomie_CGE_: { FAIT: { etapeTypeId: 'scg', etapeStatutId: 'fai', ordre: 1 } },
  saisineDesCollectivitesLocales: { FAIT: { etapeTypeId: 'scl', etapeStatutId: 'fai', ordre: 1 } },
  signatureDeLautorisationDeRechercheMiniere: { FAIT: { etapeTypeId: 'sco', etapeStatutId: 'fai', ordre: 1 } },
  saisineDuConseilDEtat: { FAIT: { etapeTypeId: 'spe', etapeStatutId: 'fai', ordre: 1 } },
  saisineDeLaCommissionDepartementaleDesMines_CDM_: { FAIT: { etapeTypeId: 'spo', etapeStatutId: 'fai', ordre: 1 } },
  saisineDuPrefet: { FAIT: { etapeTypeId: 'spp', etapeStatutId: 'fai', ordre: 1 } },
  saisineDesServices: { FAIT: { etapeTypeId: 'ssr', etapeStatutId: 'fai', ordre: 1 } },
  validationDuPaiementDesFraisDeDossierComplementaires: { FAIT: { etapeTypeId: 'vfc', etapeStatutId: 'fai', ordre: 1 } },
  validationDuPaiementDesFraisDeDossier: { FAIT: { etapeTypeId: 'vfd', etapeStatutId: 'fai', ordre: 1 } },
  abandonDeLaDemande: { FAIT: { etapeTypeId: 'wab', etapeStatutId: 'fai', ordre: 1 } },
  avisDeDirectionRegionaleDesAffairesCulturellesDRAC: {
    DEFAVORABLE: { etapeTypeId: 'wac', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wac', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDeLaDirectionDepartementaleDesTerritoiresEtDeLaMerDDT_M_: {
    DEFAVORABLE: { etapeTypeId: 'wad', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wad', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDeLautoriteEnvironnementale: {
    DEFAVORABLE: { etapeTypeId: 'wae', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wae', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDesAutresInstances: {
    DEFAVORABLE: { etapeTypeId: 'wai', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wai', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDunServiceAdministratifLocal_wal: {
    DEFAVORABLE: { etapeTypeId: 'wal', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wal', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDeLautoriteMilitaire_wam: {
    DEFAVORABLE: { etapeTypeId: 'wam', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wam', etapeStatutId: 'fav', ordre: 1 },
  },
  arreteDouvertureDesTravauxMiniers: { FAIT: { etapeTypeId: 'wao', etapeStatutId: 'fai', ordre: 1 } },
  avisDuPrefetMaritime_wap: {
    DEFAVORABLE: { etapeTypeId: 'wap', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wap', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDeReception: { FAIT: { etapeTypeId: 'war', etapeStatutId: 'fai', ordre: 1 } },
  avisDeLagenceRegionaleDeSanteARS: {
    DEFAVORABLE: { etapeTypeId: 'was', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'was', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst__wat: {
    DEFAVORABLE: { etapeTypeId: 'wat', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wat', etapeStatutId: 'fav', ordre: 1 },
  },
  avisDuDemandeurSurLesPrescriptionsProposees: {
    DEFAVORABLE: { etapeTypeId: 'wau', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wau', etapeStatutId: 'fav', ordre: 1 },
  },
  clotureDeLenquetePublique_wce: { TERMINE: { etapeTypeId: 'wce', etapeStatutId: 'ter', ordre: 1 } },
  donneActeDeLaDeclaration_DOTM_: { FAIT: { etapeTypeId: 'wda', etapeStatutId: 'fai', ordre: 1 } },
  demandeDeComplements_AOTMOuDOTM_: { FAIT: { etapeTypeId: 'wdc', etapeStatutId: 'fai', ordre: 1 } },
  depotDeLaDemande_wdd: { FAIT: { etapeTypeId: 'wdd', etapeStatutId: 'fai', ordre: 1 } },
  demandeDeComplements_DADT_: { FAIT: { etapeTypeId: 'wde', etapeStatutId: 'fai', ordre: 1 } },
  decisionDeLadministration_wdm: {
    ACCEPTE: { etapeTypeId: 'wdm', etapeStatutId: 'acc', ordre: 1 },
    REJETE: { etapeTypeId: 'wdm', etapeStatutId: 'rej', ordre: 1 },
  },
  demandeDautorisationDouvertureDeTravauxMiniers_AOTM_: { FAIT: { etapeTypeId: 'wfa', etapeStatutId: 'fai', ordre: 1 } },
  declarationDarretDefinitifDeTravaux_DADT_: { FAIT: { etapeTypeId: 'wfd', etapeStatutId: 'fai', ordre: 1 } },
  declarationDouvertureDeTravauxMiniers_DOTM_: { FAIT: { etapeTypeId: 'wfo', etapeStatutId: 'fai', ordre: 1 } },
  demandeDautorisationDouvertureDeTravauxMiniers_DAOTM_: { DEPOSE: { etapeTypeId: 'wfr', etapeStatutId: 'dep', ordre: 1 } },
  memoireEnReponseDeLexploitant_ParRapportALavisDeLAE_: { FAIT: { etapeTypeId: 'wmm', etapeStatutId: 'fai', ordre: 1 } },
  memoireEnReponseDeLexploitant: { DEPOSE: { etapeTypeId: 'wmr', etapeStatutId: 'dep', ordre: 1 } },
  memoireDeFinDeTravaux: { FAIT: { etapeTypeId: 'wmt', etapeStatutId: 'fai', ordre: 1 } },
  ouvertureDeLenquetePublique_woe: {
    FAIT: { etapeTypeId: 'woe', etapeStatutId: 'fai', ordre: 1 },
    PROGRAMME: { etapeTypeId: 'woe', etapeStatutId: 'pro', ordre: 1 },
  },
  publicationDeDecisionAuRecueilDesActesAdministratifs_wpa: { FAIT: { etapeTypeId: 'wpa', etapeStatutId: 'fai', ordre: 1 } },
  porterAConnaissance: { FAIT: { etapeTypeId: 'wpb', etapeStatutId: 'fai', ordre: 1 } },
  arreteDePrescriptionsComplementaires: { FAIT: { etapeTypeId: 'wpc', etapeStatutId: 'fai', ordre: 1 } },
  arreteDeSecondDonnerActe: { ACCEPTE: { etapeTypeId: 'wpo', etapeStatutId: 'acc', ordre: 1 } },
  arretePrefectoralDePremierDonnerActe_DADT_: { FAIT: { etapeTypeId: 'wpp', etapeStatutId: 'fai', ordre: 1 } },
  arretePrefectoralDeSursisAStatuer: { FAIT: { etapeTypeId: 'wps', etapeStatutId: 'fai', ordre: 1 } },
  receptionDeComplements_wrc: { FAIT: { etapeTypeId: 'wrc', etapeStatutId: 'fai', ordre: 1 } },
  rapportDeLaDreal: {
    DEFAVORABLE: { etapeTypeId: 'wrd', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wrd', etapeStatutId: 'fav', ordre: 1 },
  },
  recevabilite: {
    DEFAVORABLE: { etapeTypeId: 'wre', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wre', etapeStatutId: 'fav', ordre: 1 },
  },
  avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement_wrl: {
    DEFAVORABLE: { etapeTypeId: 'wrl', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wrl', etapeStatutId: 'fav', ordre: 1 },
  },
  recolement: {
    DEFAVORABLE: { etapeTypeId: 'wrt', etapeStatutId: 'def', ordre: 1 },
    FAVORABLE: { etapeTypeId: 'wrt', etapeStatutId: 'fav', ordre: 1 },
  },
  saisineDeLautoriteEnvironnementale: { FAIT: { etapeTypeId: 'wse', etapeStatutId: 'fai', ordre: 1 } },
  saisineDesServicesDeLEtat: { FAIT: { etapeTypeId: 'wss', etapeStatutId: 'fai', ordre: 1 } },
  transmissionDuProjetDePrescriptionsAuDemandeur: { FAIT: { etapeTypeId: 'wtp', etapeStatutId: 'fai', ordre: 1 } },
  receptionDeComplements_wco: { FAIT: { etapeTypeId: 'wco', etapeStatutId: 'fai', ordre: 1 } },
  avisDeLaDDT_M_: { FAIT: { etapeTypeId: 'wdt', etapeStatutId: 'fai', ordre: 1 } },
  consultationCLEDuSAGE: {
    FAVORABLE: { etapeTypeId: 'ccs', etapeStatutId: 'fav', ordre: 1 },
    DEFAVORABLE: { etapeTypeId: 'ccs', etapeStatutId: 'def', ordre: 2 },
  },
} as const satisfies { [key in keyof typeof ETAPES_TYPES]: { [other in keyof typeof ETAPES_STATUTS]?: EtapeTypeEtapeStatut<(typeof ETAPES_TYPES)[key], (typeof ETAPES_STATUTS)[other]> } }

const isEtapesTypesEtapesStatutsKey = (value: string): value is keyof typeof EtapesTypesEtapesStatuts => {
  return value in EtapesTypesEtapesStatuts
}

const etapesTypeEntries = Object.entries(ETAPES_TYPES)
export const getEtapesStatuts = (etapeTypeIdToFind: EtapeTypeId): EtapeStatut[] => {
  const entry = etapesTypeEntries.find(([_key, value]) => value === etapeTypeIdToFind)
  if (!entry) {
    return []
  }
  const etapesTypesEtapesStatutsKey = entry[0]
  if (isEtapesTypesEtapesStatutsKey(etapesTypesEtapesStatutsKey)) {
    const tuple = EtapesTypesEtapesStatuts[etapesTypesEtapesStatutsKey]

    return Object.values(tuple).map(({ etapeStatutId }: { etapeStatutId: EtapeStatutId }) => EtapesStatuts[etapeStatutId])
  }

  return []
}

export const etapesTypesEtapesStatutsMetas = Object.values(EtapesTypesEtapesStatuts).flatMap(stuff => Object.values(stuff))
