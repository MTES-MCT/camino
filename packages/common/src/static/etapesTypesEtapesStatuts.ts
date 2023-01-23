import { EtapesStatuts, EtapeStatut, EtapeStatutId } from './etapesStatuts.js'
import { ETAPES_TYPES, EtapeTypeId } from './etapesTypes.js'

export interface EtapeTypeEtapeStatut {
  etapeStatutId: EtapeStatutId
  etapeTypeId: EtapeTypeId
  ordre: number
}

export const EtapesTypesEtapesStatuts = {
  avisDeDirectionRegionaleDesAffairesCulturelles: {
    DEFAVORABLE: { etapeTypeId: 'aac', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aac', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'aac', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aac', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet: {
    DEFAVORABLE: { etapeTypeId: 'aaf', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aaf', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'aaf', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aaf', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  abrogationDeLaDecision: { FAIT: { etapeTypeId: 'abd', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_: {
    DEFAVORABLE: { etapeTypeId: 'abs', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'abs', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'abs', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'abs', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_: {
    AJOURNE: { etapeTypeId: 'aca', etapeStatutId: 'ajo', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE: { etapeTypeId: 'aca', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'aca', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst_: {
    DEFAVORABLE: { etapeTypeId: 'acd', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'acd', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'acd', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'acd', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDuConseilGeneralDeLeconomie_CGE_: {
    DEFAVORABLE: { etapeTypeId: 'acg', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'acg', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'acg', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'acg', etapeStatutId: 'fre', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDuneCollectiviteLocale: {
    DEFAVORABLE: { etapeTypeId: 'acl', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'acl', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avenantALautorisationDeRechercheMiniere: { FAIT: { etapeTypeId: 'aco', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi: {
    DEFAVORABLE: { etapeTypeId: 'aec', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aec', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'aec', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aec', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDunPresidentDEPCI: {
    DEFAVORABLE: { etapeTypeId: 'aep', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aep', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'aep', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aep', etapeStatutId: 'fre', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDeLaDirectionRegionaleDesFinancesPubliques: {
    DEFAVORABLE: { etapeTypeId: 'afp', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'afp', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'afp', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'afp', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDeLaGendarmerieNationale: {
    DEFAVORABLE: { etapeTypeId: 'agn', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'agn', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'agn', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'agn', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDeLIfremer: {
    DEFAVORABLE: { etapeTypeId: 'aim', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aim', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'aim', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aim', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDunMaire: {
    DEFAVORABLE: { etapeTypeId: 'ama', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ama', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'ama', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ama', etapeStatutId: 'fre', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDuParcNaturelMarin: {
    DEFAVORABLE: { etapeTypeId: 'ami', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ami', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'ami', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ami', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  decisionDuJugeAdministratif: {
    ACCEPTE: { etapeTypeId: 'and', etapeStatutId: 'acc', ordre: 2 } as EtapeTypeEtapeStatut,
    FAIT: { etapeTypeId: 'and', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut,
    REJETE: { etapeTypeId: 'and', etapeStatutId: 'rej', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDeMiseEnConcurrenceAuJOUE: {
    EN_COURS: { etapeTypeId: 'ane', etapeStatutId: 'enc', ordre: 2 } as EtapeTypeEtapeStatut,
    FAIT: { etapeTypeId: 'ane', etapeStatutId: 'fai', ordre: 4 } as EtapeTypeEtapeStatut,
    PROGRAMME: { etapeTypeId: 'ane', etapeStatutId: 'pro', ordre: 1 } as EtapeTypeEtapeStatut,
    TERMINE: { etapeTypeId: 'ane', etapeStatutId: 'ter', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDeMiseEnConcurrenceAuJORF: {
    EN_COURS: { etapeTypeId: 'anf', etapeStatutId: 'enc', ordre: 2 } as EtapeTypeEtapeStatut,
    FAIT: { etapeTypeId: 'anf', etapeStatutId: 'fai', ordre: 4 } as EtapeTypeEtapeStatut,
    PROGRAMME: { etapeTypeId: 'anf', etapeStatutId: 'pro', ordre: 1 } as EtapeTypeEtapeStatut,
    TERMINE: { etapeTypeId: 'anf', etapeStatutId: 'ter', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDeLOfficeNationalDesForets: {
    DEFAVORABLE: { etapeTypeId: 'aof', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aof', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'aof', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aof', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDeLInstitutNationalDeLorigineEtDeLaQualite: {
    DEFAVORABLE: { etapeTypeId: 'aop', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'aop', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement: {
    DEFAVORABLE: { etapeTypeId: 'apd', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apd', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'apd', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apd', etapeStatutId: 'fre', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDuConseilDEtat: {
    DEFAVORABLE: { etapeTypeId: 'ape', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ape', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'ape', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ape', etapeStatutId: 'fre', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDeLetatMajorOrpaillageEtPecheIllicite_EMOPI_: {
    DEFAVORABLE: { etapeTypeId: 'api', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'api', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'api', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'api', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDunServiceAdministratifLocal: {
    DEFAVORABLE: { etapeTypeId: 'apl', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apl', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'apl', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apl', etapeStatutId: 'fre', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDeLautoriteMilitaire: {
    DEFAVORABLE: { etapeTypeId: 'apm', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apm', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'apm', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apm', etapeStatutId: 'fre', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDuParcNational: {
    DEFAVORABLE: { etapeTypeId: 'apn', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'apn', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDeLaCommissionDepartementaleDesMines_CDM_: {
    AJOURNE: { etapeTypeId: 'apo', etapeStatutId: 'ajo', ordre: 1 } as EtapeTypeEtapeStatut,
    DEFAVORABLE: { etapeTypeId: 'apo', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apo', etapeStatutId: 'dre', ordre: 5 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'apo', etapeStatutId: 'fav', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apo', etapeStatutId: 'fre', ordre: 4 } as EtapeTypeEtapeStatut
  },
  avisDuPrefet: {
    DEFAVORABLE: { etapeTypeId: 'app', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'app', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'app', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'app', etapeStatutId: 'fre', ordre: 3 } as EtapeTypeEtapeStatut
  },
  publicationDeLavisDeDecisionImplicite: {
    ACCEPTE: { etapeTypeId: 'apu', etapeStatutId: 'acc', ordre: 2 } as EtapeTypeEtapeStatut,
    FAIT: { etapeTypeId: 'apu', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut,
    REJETE: { etapeTypeId: 'apu', etapeStatutId: 'rej', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDuPrefetMaritime: {
    DEFAVORABLE: { etapeTypeId: 'apw', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apw', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'apw', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apw', etapeStatutId: 'fre', ordre: 3 } as EtapeTypeEtapeStatut
  },
  avisDeLaReunionInterservice: {
    DEFAVORABLE: { etapeTypeId: 'ari', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'ari', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDeLagenceRegionaleDeSante: {
    DEFAVORABLE: { etapeTypeId: 'ars', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ars', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'ars', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ars', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  decisionDuProprietaireDuSol: {
    DEFAVORABLE: { etapeTypeId: 'asl', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'asl', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'asl', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDeLaCaisseGeneraleDeSecuriteSociale: {
    DEFAVORABLE: { etapeTypeId: 'ass', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ass', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'ass', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ass', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_: {
    DEFAVORABLE: { etapeTypeId: 'auc', etapeStatutId: 'def', ordre: 3 } as EtapeTypeEtapeStatut,
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'auc', etapeStatutId: 'dre', ordre: 4 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'auc', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'auc', etapeStatutId: 'fre', ordre: 2 } as EtapeTypeEtapeStatut
  },
  consultationDesAdministrationsCentrales: { FAIT: { etapeTypeId: 'cac', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  concertationInterministerielle: { FAIT: { etapeTypeId: 'cim', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  saisineDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst_: { FAIT: { etapeTypeId: 'cod', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  confirmationDeLaccordDuProprietaireDuSol: {
    DEFAVORABLE: { etapeTypeId: 'cps', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'cps', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  classementSansSuite: { FAIT: { etapeTypeId: 'css', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: {
    EXEMPTE: { etapeTypeId: 'dae', etapeStatutId: 'exe', ordre: 1 } as EtapeTypeEtapeStatut,
    REQUIS: { etapeTypeId: 'dae', etapeStatutId: 'req', ordre: 2 } as EtapeTypeEtapeStatut
  },
  declaration: { FAIT: { etapeTypeId: 'dec', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  decisionDeLOfficeNationalDesForets: {
    ACCEPTE: { etapeTypeId: 'def', etapeStatutId: 'acc', ordre: 1 } as EtapeTypeEtapeStatut,
    REJETE: { etapeTypeId: 'def', etapeStatutId: 'rej', ordre: 2 } as EtapeTypeEtapeStatut
  },
  desistementDuDemandeur: { FAIT: { etapeTypeId: 'des', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  decisionDeLadministration: {
    ACCEPTE: { etapeTypeId: 'dex', etapeStatutId: 'acc', ordre: 1 } as EtapeTypeEtapeStatut,
    REJETE: { etapeTypeId: 'dex', etapeStatutId: 'rej', ordre: 2 } as EtapeTypeEtapeStatut
  },
  decisionImplicite: {
    ACCEPTE: { etapeTypeId: 'dim', etapeStatutId: 'acc', ordre: 1 } as EtapeTypeEtapeStatut,
    REJETE: { etapeTypeId: 'dim', etapeStatutId: 'rej', ordre: 2 } as EtapeTypeEtapeStatut
  },
  publicationDeDecisionAuJORF: {
    ACCEPTE: { etapeTypeId: 'dpu', etapeStatutId: 'acc', ordre: 1 } as EtapeTypeEtapeStatut,
    REJETE: { etapeTypeId: 'dpu', etapeStatutId: 'rej', ordre: 2 } as EtapeTypeEtapeStatut
  },
  publicationDeDecisionAdministrativeAuJORF: { FAIT: { etapeTypeId: 'dup', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  decisionAdministrative: { FAIT: { etapeTypeId: 'dux', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  expertiseDREALOuDGTMServiceEau: {
    DEFAVORABLE: { etapeTypeId: 'ede', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'ede', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_: {
    DEFAVORABLE: { etapeTypeId: 'edm', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'edm', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  expertiseDeLOfficeNationalDesForets: { FAIT: { etapeTypeId: 'eof', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  clotureDeLenquetePublique: { TERMINE: { etapeTypeId: 'epc', etapeStatutId: 'ter', ordre: 1 } as EtapeTypeEtapeStatut },
  ouvertureDeLenquetePublique: {
    FAIT: { etapeTypeId: 'epu', etapeStatutId: 'fai', ordre: 2 } as EtapeTypeEtapeStatut,
    PROGRAMME: { etapeTypeId: 'epu', etapeStatutId: 'pro', ordre: 1 } as EtapeTypeEtapeStatut
  },
  expertiseDREALOuDGTMServiceBiodiversite: { FAIT: { etapeTypeId: 'esb', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  initiationDeLaDemarcheDeRetrait: { FAIT: { etapeTypeId: 'ide', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  informationsHistoriquesIncompletes: { FAIT: { etapeTypeId: 'ihi', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDeComplements_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'mca', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_: { FAIT: { etapeTypeId: 'mcb', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: { FAIT: { etapeTypeId: 'mcd', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDeComplements_CompletudeDeLaDemande_: { FAIT: { etapeTypeId: 'mcm', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDeComplements: { FAIT: { etapeTypeId: 'mco', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  completudeDeLaDemande: {
    COMPLETE: { etapeTypeId: 'mcp', etapeStatutId: 'com', ordre: 1 } as EtapeTypeEtapeStatut,
    INCOMPLETE: { etapeTypeId: 'mcp', etapeStatutId: 'inc', ordre: 2 } as EtapeTypeEtapeStatut
  },
  recevabiliteDeLaDemande: {
    DEFAVORABLE: { etapeTypeId: 'mcr', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'mcr', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  demandeDeComplements_SaisineDeLaCARM_: { FAIT: { etapeTypeId: 'mcs', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  depotDeLaDemande: { FAIT: { etapeTypeId: 'mdp', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  avisDeDemandeConcurrente: { FAIT: { etapeTypeId: 'mec', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  enregistrementDeLaDemande: { FAIT: { etapeTypeId: 'men', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  priseEnChargeParLOfficeNationalDesForets: { FAIT: { etapeTypeId: 'meo', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demande: {
    EN_CONSTRUCTION: { etapeTypeId: 'mfr', etapeStatutId: 'aco', ordre: 1 } as EtapeTypeEtapeStatut,
    FAIT: { etapeTypeId: 'mfr', etapeStatutId: 'fai', ordre: 2 } as EtapeTypeEtapeStatut
  },
  demandeDinformations_AvisDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'mia', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDinformations_AvisDuDREALDEALOuDGTM_: { FAIT: { etapeTypeId: 'mie', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDinformations: { FAIT: { etapeTypeId: 'mif', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDinformations_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'mim', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDinformations_ExpertiseDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'mio', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  notificationAuDemandeur_AjournementDeLaCARM_: { FAIT: { etapeTypeId: 'mna', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  notificationAuDemandeur_AvisFavorableDeLaCARM_: { FAIT: { etapeTypeId: 'mnb', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  notificationAuDemandeur_ClassementSansSuite_: { FAIT: { etapeTypeId: 'mnc', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  notificationAuDemandeur_AvisDefavorable_: { FAIT: { etapeTypeId: 'mnd', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  notificationAuDemandeur_InitiationDeLaDemarcheDeRetrait_: { FAIT: { etapeTypeId: 'mni', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  notificationAuDemandeur: { FAIT: { etapeTypeId: 'mno', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_: { FAIT: { etapeTypeId: 'mns', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_: { FAIT: { etapeTypeId: 'mnv', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  modificationDeLaDemande: { FAIT: { etapeTypeId: 'mod', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: { FAIT: { etapeTypeId: 'mom', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  notificationDesCollectivitesLocales: { FAIT: { etapeTypeId: 'ncl', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  noteInterneSignalee: { FAIT: { etapeTypeId: 'nis', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  notificationAuPrefet: { FAIT: { etapeTypeId: 'npp', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  paiementDesFraisDeDossierComplementaires: { FAIT: { etapeTypeId: 'pfc', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  paiementDesFraisDeDossier: { FAIT: { etapeTypeId: 'pfd', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  avisDuParcNaturelRegional: {
    DEFAVORABLE: { etapeTypeId: 'pnr', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'pnr', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  clotureDeLaParticipationDuPublic: { TERMINE: { etapeTypeId: 'ppc', etapeStatutId: 'ter', ordre: 1 } as EtapeTypeEtapeStatut },
  ouvertureDeLaParticipationDuPublic: {
    FAIT: { etapeTypeId: 'ppu', etapeStatutId: 'fai', ordre: 2 } as EtapeTypeEtapeStatut,
    PROGRAMME: { etapeTypeId: 'ppu', etapeStatutId: 'pro', ordre: 1 } as EtapeTypeEtapeStatut
  },
  publicationDansUnJournalLocalOuNational: { FAIT: { etapeTypeId: 'pqr', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDeComplements_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'rca', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_: { FAIT: { etapeTypeId: 'rcb', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet__: { FAIT: { etapeTypeId: 'rcd', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  rapportDuConseilGeneralDeLeconomie_CGE_: {
    DEFAVORABLE: { etapeTypeId: 'rcg', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'rcg', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  receptionDeComplements_CompletudeDeLaDemande_: { FAIT: { etapeTypeId: 'rcm', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDeComplements: { FAIT: { etapeTypeId: 'rco', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDeComplements_SaisineDeLaCARM_: { FAIT: { etapeTypeId: 'rcs', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  recepisseDeDeclarationLoiSurLeau: {
    DEFAVORABLE: { etapeTypeId: 'rde', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'rde', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  receptionDinformation_AvisDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'ria', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDinformation_AvisDuDREALDEALOuDGTM_: { FAIT: { etapeTypeId: 'rie', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDinformation: { FAIT: { etapeTypeId: 'rif', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDinformation_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'rim', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDinformation_ExpertiseDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'rio', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  rapportDuConseilDEtat: {
    DEFAVORABLE: { etapeTypeId: 'rpe', etapeStatutId: 'def', ordre: 2 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'rpe', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  publicationDeDecisionAuRecueilDesActesAdministratifs: { FAIT: { etapeTypeId: 'rpu', etapeStatutId: 'fai', ordre: 3 } as EtapeTypeEtapeStatut },
  retraitDeLaDecision: { FAIT: { etapeTypeId: 'rtd', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  saisineDeLautoriteSignataire: { FAIT: { etapeTypeId: 'sas', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_: { FAIT: { etapeTypeId: 'sca', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  saisineDuConseilGeneralDeLeconomie_CGE_: { FAIT: { etapeTypeId: 'scg', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  saisineDesCollectivitesLocales: { FAIT: { etapeTypeId: 'scl', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  signatureDeLautorisationDeRechercheMiniere: { FAIT: { etapeTypeId: 'sco', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  saisineDuConseilDEtat: { FAIT: { etapeTypeId: 'spe', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  saisineDeLaCommissionDepartementaleDesMines_CDM_: { FAIT: { etapeTypeId: 'spo', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  saisineDuPrefet: { FAIT: { etapeTypeId: 'spp', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  saisineDesServices: { FAIT: { etapeTypeId: 'ssr', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  validationDuPaiementDesFraisDeDossierComplementaires: { FAIT: { etapeTypeId: 'vfc', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  validationDuPaiementDesFraisDeDossier: { FAIT: { etapeTypeId: 'vfd', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  abandonDeLaDemande: { FAIT: { etapeTypeId: 'wab', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  avisDeDirectionRegionaleDesAffairesCulturellesDRAC: {
    DEFAVORABLE: { etapeTypeId: 'wac', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wac', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDeLaDirectionDepartementaleDesTerritoiresEtDeLaMerDDT_M_: {
    DEFAVORABLE: { etapeTypeId: 'wad', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wad', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDeLautoriteEnvironnementale: {
    DEFAVORABLE: { etapeTypeId: 'wae', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wae', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDesAutresInstances: {
    DEFAVORABLE: { etapeTypeId: 'wai', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wai', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDunServiceAdministratifLocal_wal: {
    DEFAVORABLE: { etapeTypeId: 'wal', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wal', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDeLautoriteMilitaire_wam: {
    DEFAVORABLE: { etapeTypeId: 'wam', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wam', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  arreteDouvertureDesTravauxMiniers: { FAIT: { etapeTypeId: 'wao', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  avisDuPrefetMaritime_wap: {
    DEFAVORABLE: { etapeTypeId: 'wap', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wap', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDeReception: { FAIT: { etapeTypeId: 'war', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  avisDeLagenceRegionaleDeSanteARS: {
    DEFAVORABLE: { etapeTypeId: 'was', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'was', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst__wat: {
    DEFAVORABLE: { etapeTypeId: 'wat', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wat', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisDuDemandeurSurLesPrescriptionsProposees: {
    DEFAVORABLE: { etapeTypeId: 'wau', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wau', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  clotureDeLenquetePublique_wce: { TERMINE: { etapeTypeId: 'wce', etapeStatutId: 'ter', ordre: 1 } as EtapeTypeEtapeStatut },
  donneActeDeLaDeclaration_DOTM_: { FAIT: { etapeTypeId: 'wda', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDeComplements_AOTMOuDOTM_: { FAIT: { etapeTypeId: 'wdc', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  depotDeLaDemande_wdd: { FAIT: { etapeTypeId: 'wdd', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDeComplements_DADT_: { FAIT: { etapeTypeId: 'wde', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  decisionDeLadministration_wdm: {
    ACCEPTE: { etapeTypeId: 'wdm', etapeStatutId: 'acc', ordre: 1 } as EtapeTypeEtapeStatut,
    REJETE: { etapeTypeId: 'wdm', etapeStatutId: 'rej', ordre: 1 } as EtapeTypeEtapeStatut
  },
  demandeDautorisationDouvertureDeTravauxMiniers_AOTM_: { FAIT: { etapeTypeId: 'wfa', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  declarationDarretDefinitifDeTravaux_DADT_: { FAIT: { etapeTypeId: 'wfd', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  declarationDouvertureDeTravauxMiniers_DOTM_: { FAIT: { etapeTypeId: 'wfo', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  demandeDautorisationDouvertureDeTravauxMiniers_DAOTM_: { DEPOSE: { etapeTypeId: 'wfr', etapeStatutId: 'dep', ordre: 1 } as EtapeTypeEtapeStatut },
  memoireEnReponseDeLexploitant_ParRapportALavisDeLAE_: { FAIT: { etapeTypeId: 'wmm', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  memoireEnReponseDeLexploitant: { DEPOSE: { etapeTypeId: 'wmr', etapeStatutId: 'dep', ordre: 1 } as EtapeTypeEtapeStatut },
  memoireDeFinDeTravaux: { FAIT: { etapeTypeId: 'wmt', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  ouvertureDeLenquetePublique_woe: {
    FAIT: { etapeTypeId: 'woe', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut,
    PROGRAMME: { etapeTypeId: 'woe', etapeStatutId: 'pro', ordre: 1 } as EtapeTypeEtapeStatut
  },
  publicationDeDecisionAuRecueilDesActesAdministratifs_wpa: { FAIT: { etapeTypeId: 'wpa', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  porterAConnaissance: { FAIT: { etapeTypeId: 'wpb', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  arreteDePrescriptionsComplementaires: { FAIT: { etapeTypeId: 'wpc', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  arreteDeSecondDonnerActe: { ACCEPTE: { etapeTypeId: 'wpo', etapeStatutId: 'acc', ordre: 1 } as EtapeTypeEtapeStatut },
  arretePrefectoralDePremierDonnerActe_DADT_: { FAIT: { etapeTypeId: 'wpp', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  arretePrefectoralDeSursisAStatuer: { FAIT: { etapeTypeId: 'wps', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDeComplements_wrc: { FAIT: { etapeTypeId: 'wrc', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  rapportDeLaDreal: {
    DEFAVORABLE: { etapeTypeId: 'wrd', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wrd', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  recevabilite: {
    DEFAVORABLE: { etapeTypeId: 'wre', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wre', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement_wrl: {
    DEFAVORABLE: { etapeTypeId: 'wrl', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wrl', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  recolement: {
    DEFAVORABLE: { etapeTypeId: 'wrt', etapeStatutId: 'def', ordre: 1 } as EtapeTypeEtapeStatut,
    FAVORABLE: { etapeTypeId: 'wrt', etapeStatutId: 'fav', ordre: 1 } as EtapeTypeEtapeStatut
  },
  saisineDeLautoriteEnvironnementale: { FAIT: { etapeTypeId: 'wse', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  saisineDesServicesDeLEtat: { FAIT: { etapeTypeId: 'wss', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  transmissionDuProjetDePrescriptionsAuDemandeur: { FAIT: { etapeTypeId: 'wtp', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  receptionDeComplements_wco: { FAIT: { etapeTypeId: 'wco', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  avisDeLaDDT_M_: { FAIT: { etapeTypeId: 'wdt', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut },
  consultationCLEDuSAGE: { FAIT: { etapeTypeId: 'ccs', etapeStatutId: 'fai', ordre: 1 } as EtapeTypeEtapeStatut }
} as const

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

    return Object.values(tuple).map(({ etapeStatutId }) => EtapesStatuts[etapeStatutId])
  }

  return []
}
