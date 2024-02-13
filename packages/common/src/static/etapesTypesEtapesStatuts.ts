import { EtapesStatuts, EtapeStatut, EtapeStatutId, ETAPES_STATUTS } from './etapesStatuts.js'
import { ETAPES_TYPES, EtapeTypeId } from './etapesTypes.js'

export interface EtapeTypeEtapeStatut<T extends EtapeTypeId, R extends EtapeStatutId> {
  etapeStatutId: R
  etapeTypeId: T
}

export const EtapesTypesEtapesStatuts = {
  avisDeDirectionRegionaleDesAffairesCulturelles: {
    FAVORABLE: { etapeTypeId: 'aac', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aac', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'aac', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aac', etapeStatutId: 'dre' },
  },
  avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet: {
    FAVORABLE: { etapeTypeId: 'aaf', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aaf', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'aaf', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aaf', etapeStatutId: 'dre' },
  },
  abrogationDeLaDecision: { FAIT: { etapeTypeId: 'abd', etapeStatutId: 'fai' } },
  avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_: {
    FAVORABLE: { etapeTypeId: 'abs', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'abs', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'abs', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'abs', etapeStatutId: 'dre' },
  },
  avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_: {
    FAVORABLE: { etapeTypeId: 'aca', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'aca', etapeStatutId: 'def' },
    AJOURNE: { etapeTypeId: 'aca', etapeStatutId: 'ajo' },
  },
  avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst_: {
    FAVORABLE: { etapeTypeId: 'acd', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'acd', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'acd', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'acd', etapeStatutId: 'dre' },
  },
  avisDuConseilGeneralDeLeconomie_CGE_: {
    FAVORABLE: { etapeTypeId: 'acg', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'acg', etapeStatutId: 'def' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'acg', etapeStatutId: 'fre' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'acg', etapeStatutId: 'dre' },
  },
  avisDuneCollectiviteLocale: {
    FAVORABLE: { etapeTypeId: 'acl', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'acl', etapeStatutId: 'def' },
  },
  avenantALautorisationDeRechercheMiniere: { FAIT: { etapeTypeId: 'aco', etapeStatutId: 'fai' } },
  avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi: {
    FAVORABLE: { etapeTypeId: 'aec', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aec', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'aec', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aec', etapeStatutId: 'dre' },
  },
  avisDunPresidentDEPCI: {
    FAVORABLE: { etapeTypeId: 'aep', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'aep', etapeStatutId: 'def' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aep', etapeStatutId: 'fre' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aep', etapeStatutId: 'dre' },
  },
  avisDeLaDirectionRegionaleDesFinancesPubliques: {
    FAVORABLE: { etapeTypeId: 'afp', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'afp', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'afp', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'afp', etapeStatutId: 'dre' },
  },
  avisDeLaGendarmerieNationale: {
    FAVORABLE: { etapeTypeId: 'agn', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'agn', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'agn', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'agn', etapeStatutId: 'dre' },
  },
  avisDeLIfremer: {
    FAVORABLE: { etapeTypeId: 'aim', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aim', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'aim', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aim', etapeStatutId: 'dre' },
  },
  avisDunMaire: {
    FAVORABLE: { etapeTypeId: 'ama', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'ama', etapeStatutId: 'def' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ama', etapeStatutId: 'fre' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ama', etapeStatutId: 'dre' },
  },
  avisDuParcNaturelMarin: {
    FAVORABLE: { etapeTypeId: 'ami', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ami', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'ami', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ami', etapeStatutId: 'dre' },
  },
  decisionDuJugeAdministratif: {
    FAIT: { etapeTypeId: 'and', etapeStatutId: 'fai' },
    ACCEPTE: { etapeTypeId: 'and', etapeStatutId: 'acc' },
    REJETE: { etapeTypeId: 'and', etapeStatutId: 'rej' },
  },
  avisDeMiseEnConcurrenceAuJOUE: {
    PROGRAMME: { etapeTypeId: 'ane', etapeStatutId: 'pro' },
    EN_COURS: { etapeTypeId: 'ane', etapeStatutId: 'enc' },
    TERMINE: { etapeTypeId: 'ane', etapeStatutId: 'ter' },
    FAIT: { etapeTypeId: 'ane', etapeStatutId: 'fai' },
  },
  avisDeMiseEnConcurrenceAuJORF: {
    PROGRAMME: { etapeTypeId: 'anf', etapeStatutId: 'pro' },
    EN_COURS: { etapeTypeId: 'anf', etapeStatutId: 'enc' },
    TERMINE: { etapeTypeId: 'anf', etapeStatutId: 'ter' },
    FAIT: { etapeTypeId: 'anf', etapeStatutId: 'fai' },
  },
  avisDeLOfficeNationalDesForets: {
    FAVORABLE: { etapeTypeId: 'aof', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'aof', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'aof', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'aof', etapeStatutId: 'dre' },
  },
  avisDeLInstitutNationalDeLorigineEtDeLaQualite: {
    FAVORABLE: { etapeTypeId: 'aop', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'aop', etapeStatutId: 'def' },
  },
  avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement: {
    FAVORABLE: { etapeTypeId: 'apd', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'apd', etapeStatutId: 'def' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apd', etapeStatutId: 'fre' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apd', etapeStatutId: 'dre' },
  },
  avisDuConseilDEtat: {
    FAVORABLE: { etapeTypeId: 'ape', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'ape', etapeStatutId: 'def' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ape', etapeStatutId: 'fre' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ape', etapeStatutId: 'dre' },
  },
  avisDeLetatMajorOrpaillageEtPecheIllicite_EMOPI_: {
    FAVORABLE: { etapeTypeId: 'api', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'api', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'api', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'api', etapeStatutId: 'dre' },
  },
  avisDunServiceAdministratifLocal: {
    FAVORABLE: { etapeTypeId: 'apl', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'apl', etapeStatutId: 'def' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apl', etapeStatutId: 'fre' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apl', etapeStatutId: 'dre' },
  },
  avisDeLautoriteMilitaire: {
    FAVORABLE: { etapeTypeId: 'apm', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'apm', etapeStatutId: 'def' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apm', etapeStatutId: 'fre' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apm', etapeStatutId: 'dre' },
  },
  avisDuParcNational: {
    FAVORABLE: { etapeTypeId: 'apn', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'apn', etapeStatutId: 'def' },
  },
  avisDeLaCommissionDepartementaleDesMines_CDM_: {
    AJOURNE: { etapeTypeId: 'apo', etapeStatutId: 'ajo' },
    FAVORABLE: { etapeTypeId: 'apo', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'apo', etapeStatutId: 'def' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apo', etapeStatutId: 'fre' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apo', etapeStatutId: 'dre' },
  },
  avisDuPrefet: {
    FAVORABLE: { etapeTypeId: 'app', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'app', etapeStatutId: 'def' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'app', etapeStatutId: 'fre' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'app', etapeStatutId: 'dre' },
  },
  publicationDeLavisDeDecisionImplicite: {
    FAIT: { etapeTypeId: 'apu', etapeStatutId: 'fai' },
    ACCEPTE: { etapeTypeId: 'apu', etapeStatutId: 'acc' },
    REJETE: { etapeTypeId: 'apu', etapeStatutId: 'rej' },
  },
  avisDuPrefetMaritime: {
    FAVORABLE: { etapeTypeId: 'apw', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'apw', etapeStatutId: 'def' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'apw', etapeStatutId: 'fre' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'apw', etapeStatutId: 'dre' },
  },
  avisDeLaReunionInterservice: {
    FAVORABLE: { etapeTypeId: 'ari', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'ari', etapeStatutId: 'def' },
  },
  avisDeLagenceRegionaleDeSante: {
    FAVORABLE: { etapeTypeId: 'ars', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ars', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'ars', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ars', etapeStatutId: 'dre' },
  },
  decisionDuProprietaireDuSol: {
    FAVORABLE: { etapeTypeId: 'asl', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'asl', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'asl', etapeStatutId: 'def' },
  },
  avisDeLaCaisseGeneraleDeSecuriteSociale: {
    FAVORABLE: { etapeTypeId: 'ass', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'ass', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'ass', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'ass', etapeStatutId: 'dre' },
  },
  avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_: {
    FAVORABLE: { etapeTypeId: 'auc', etapeStatutId: 'fav' },
    FAVORABLE_AVEC_RESERVE: { etapeTypeId: 'auc', etapeStatutId: 'fre' },
    DEFAVORABLE: { etapeTypeId: 'auc', etapeStatutId: 'def' },
    DEFAVORABLE_AVEC_RESERVES: { etapeTypeId: 'auc', etapeStatutId: 'dre' },
  },
  consultationDesAdministrationsCentrales: { FAIT: { etapeTypeId: 'cac', etapeStatutId: 'fai' } },
  concertationInterministerielle: { FAIT: { etapeTypeId: 'cim', etapeStatutId: 'fai' } },
  saisineDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst_: { FAIT: { etapeTypeId: 'cod', etapeStatutId: 'fai' } },
  confirmationDeLaccordDuProprietaireDuSol: {
    FAVORABLE: { etapeTypeId: 'cps', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'cps', etapeStatutId: 'def' },
  },
  classementSansSuite: { FAIT: { etapeTypeId: 'css', etapeStatutId: 'fai' } },
  decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: {
    EXEMPTE: { etapeTypeId: 'dae', etapeStatutId: 'exe' },
    REQUIS: { etapeTypeId: 'dae', etapeStatutId: 'req' },
  },
  declaration: { FAIT: { etapeTypeId: 'dec', etapeStatutId: 'fai' } },
  decisionDeLOfficeNationalDesForets: {
    ACCEPTE: { etapeTypeId: 'def', etapeStatutId: 'acc' },
    REJETE: { etapeTypeId: 'def', etapeStatutId: 'rej' },
  },
  desistementDuDemandeur: { FAIT: { etapeTypeId: 'des', etapeStatutId: 'fai' } },
  decisionDeLadministration: {
    ACCEPTE: { etapeTypeId: 'dex', etapeStatutId: 'acc' },
    REJETE: { etapeTypeId: 'dex', etapeStatutId: 'rej' },
  },
  decisionImplicite: {
    ACCEPTE: { etapeTypeId: 'dim', etapeStatutId: 'acc' },
    REJETE: { etapeTypeId: 'dim', etapeStatutId: 'rej' },
  },
  publicationDeDecisionAuJORF: {
    ACCEPTE: { etapeTypeId: 'dpu', etapeStatutId: 'acc' },
    REJETE: { etapeTypeId: 'dpu', etapeStatutId: 'rej' },
  },
  publicationDeDecisionAdministrativeAuJORF: { FAIT: { etapeTypeId: 'dup', etapeStatutId: 'fai' } },
  decisionAdministrative: { FAIT: { etapeTypeId: 'dux', etapeStatutId: 'fai' } },
  expertiseDREALOuDGTMServiceEau: {
    FAVORABLE: { etapeTypeId: 'ede', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'ede', etapeStatutId: 'def' },
  },
  expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_: {
    FAVORABLE: { etapeTypeId: 'edm', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'edm', etapeStatutId: 'def' },
  },
  expertiseDeLOfficeNationalDesForets: { FAIT: { etapeTypeId: 'eof', etapeStatutId: 'fai' } },
  clotureDeLenquetePublique: { TERMINE: { etapeTypeId: 'epc', etapeStatutId: 'ter' } },
  ouvertureDeLenquetePublique: {
    PROGRAMME: { etapeTypeId: 'epu', etapeStatutId: 'pro' },
    FAIT: { etapeTypeId: 'epu', etapeStatutId: 'fai' },
  },
  expertiseDREALOuDGTMServiceBiodiversite: { FAIT: { etapeTypeId: 'esb', etapeStatutId: 'fai' } },
  initiationDeLaDemarcheDeRetrait: { FAIT: { etapeTypeId: 'ide', etapeStatutId: 'fai' } },
  informationsHistoriquesIncompletes: { FAIT: { etapeTypeId: 'ihi', etapeStatutId: 'fai' } },
  demandeDeComplements_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'mca', etapeStatutId: 'fai' } },
  demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_: { FAIT: { etapeTypeId: 'mcb', etapeStatutId: 'fai' } },
  demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: { FAIT: { etapeTypeId: 'mcd', etapeStatutId: 'fai' } },
  demandeDeComplements_CompletudeDeLaDemande_: { FAIT: { etapeTypeId: 'mcm', etapeStatutId: 'fai' } },
  demandeDeComplements: { FAIT: { etapeTypeId: 'mco', etapeStatutId: 'fai' } },
  completudeDeLaDemande: {
    COMPLETE: { etapeTypeId: 'mcp', etapeStatutId: 'com' },
    INCOMPLETE: { etapeTypeId: 'mcp', etapeStatutId: 'inc' },
  },
  recevabiliteDeLaDemande: {
    FAVORABLE: { etapeTypeId: 'mcr', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'mcr', etapeStatutId: 'def' },
  },
  demandeDeComplements_SaisineDeLaCARM_: { FAIT: { etapeTypeId: 'mcs', etapeStatutId: 'fai' } },
  depotDeLaDemande: { FAIT: { etapeTypeId: 'mdp', etapeStatutId: 'fai' } },
  avisDeDemandeConcurrente: { FAIT: { etapeTypeId: 'mec', etapeStatutId: 'fai' } },
  enregistrementDeLaDemande: { FAIT: { etapeTypeId: 'men', etapeStatutId: 'fai' } },
  priseEnChargeParLOfficeNationalDesForets: { FAIT: { etapeTypeId: 'meo', etapeStatutId: 'fai' } },
  demande: {
    EN_CONSTRUCTION: { etapeTypeId: 'mfr', etapeStatutId: 'aco' },
    FAIT: { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
  },
  demandeDinformations_AvisDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'mia', etapeStatutId: 'fai' } },
  demandeDinformations_AvisDuDREALDEALOuDGTM_: { FAIT: { etapeTypeId: 'mie', etapeStatutId: 'fai' } },
  demandeDinformations: { FAIT: { etapeTypeId: 'mif', etapeStatutId: 'fai' } },
  demandeDinformations_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'mim', etapeStatutId: 'fai' } },
  demandeDinformations_ExpertiseDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'mio', etapeStatutId: 'fai' } },
  notificationAuDemandeur_AjournementDeLaCARM_: { FAIT: { etapeTypeId: 'mna', etapeStatutId: 'fai' } },
  notificationAuDemandeur_AvisFavorableDeLaCARM_: { FAIT: { etapeTypeId: 'mnb', etapeStatutId: 'fai' } },
  notificationAuDemandeur_ClassementSansSuite_: { FAIT: { etapeTypeId: 'mnc', etapeStatutId: 'fai' } },
  notificationAuDemandeur_AvisDefavorable_: { FAIT: { etapeTypeId: 'mnd', etapeStatutId: 'fai' } },
  notificationAuDemandeur_InitiationDeLaDemarcheDeRetrait_: { FAIT: { etapeTypeId: 'mni', etapeStatutId: 'fai' } },
  notificationAuDemandeur: { FAIT: { etapeTypeId: 'mno', etapeStatutId: 'fai' } },
  notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_: { FAIT: { etapeTypeId: 'mns', etapeStatutId: 'fai' } },
  notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_: { FAIT: { etapeTypeId: 'mnv', etapeStatutId: 'fai' } },
  modificationDeLaDemande: { FAIT: { etapeTypeId: 'mod', etapeStatutId: 'fai' } },
  modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: { FAIT: { etapeTypeId: 'mom', etapeStatutId: 'fai' } },
  notificationDesCollectivitesLocales: { FAIT: { etapeTypeId: 'ncl', etapeStatutId: 'fai' } },
  noteInterneSignalee: { FAIT: { etapeTypeId: 'nis', etapeStatutId: 'fai' } },
  notificationAuPrefet: { FAIT: { etapeTypeId: 'npp', etapeStatutId: 'fai' } },
  paiementDesFraisDeDossierComplementaires: { FAIT: { etapeTypeId: 'pfc', etapeStatutId: 'fai' } },
  paiementDesFraisDeDossier: { FAIT: { etapeTypeId: 'pfd', etapeStatutId: 'fai' } },
  avisDuParcNaturelRegional: {
    FAVORABLE: { etapeTypeId: 'pnr', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'pnr', etapeStatutId: 'def' },
  },
  clotureDeLaParticipationDuPublic: { TERMINE: { etapeTypeId: 'ppc', etapeStatutId: 'ter' } },
  ouvertureDeLaParticipationDuPublic: {
    PROGRAMME: { etapeTypeId: 'ppu', etapeStatutId: 'pro' },
    FAIT: { etapeTypeId: 'ppu', etapeStatutId: 'fai' },
  },
  publicationDansUnJournalLocalOuNational: { FAIT: { etapeTypeId: 'pqr', etapeStatutId: 'fai' } },
  receptionDeComplements_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'rca', etapeStatutId: 'fai' } },
  receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_: { FAIT: { etapeTypeId: 'rcb', etapeStatutId: 'fai' } },
  receptionDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet__: { FAIT: { etapeTypeId: 'rcd', etapeStatutId: 'fai' } },
  rapportDuConseilGeneralDeLeconomie_CGE_: {
    FAVORABLE: { etapeTypeId: 'rcg', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'rcg', etapeStatutId: 'def' },
  },
  receptionDeComplements_CompletudeDeLaDemande_: { FAIT: { etapeTypeId: 'rcm', etapeStatutId: 'fai' } },
  receptionDeComplements: { FAIT: { etapeTypeId: 'rco', etapeStatutId: 'fai' } },
  receptionDeComplements_SaisineDeLaCARM_: { FAIT: { etapeTypeId: 'rcs', etapeStatutId: 'fai' } },
  recepisseDeDeclarationLoiSurLeau: {
    FAVORABLE: { etapeTypeId: 'rde', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'rde', etapeStatutId: 'def' },
  },
  receptionDinformation_AvisDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'ria', etapeStatutId: 'fai' } },
  receptionDinformation_AvisDuDREALDEALOuDGTM_: { FAIT: { etapeTypeId: 'rie', etapeStatutId: 'fai' } },
  receptionDinformation: { FAIT: { etapeTypeId: 'rif', etapeStatutId: 'fai' } },
  receptionDinformation_RecevabiliteDeLaDemande_: { FAIT: { etapeTypeId: 'rim', etapeStatutId: 'fai' } },
  receptionDinformation_ExpertiseDeLOfficeNationalDesForets_: { FAIT: { etapeTypeId: 'rio', etapeStatutId: 'fai' } },
  rapportDuConseilDEtat: {
    FAVORABLE: { etapeTypeId: 'rpe', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'rpe', etapeStatutId: 'def' },
  },
  publicationDeDecisionAuRecueilDesActesAdministratifs: { FAIT: { etapeTypeId: 'rpu', etapeStatutId: 'fai' } },
  saisineDeLautoriteSignataire: { FAIT: { etapeTypeId: 'sas', etapeStatutId: 'fai' } },
  saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_: { FAIT: { etapeTypeId: 'sca', etapeStatutId: 'fai' } },
  saisineDuConseilGeneralDeLeconomie_CGE_: { FAIT: { etapeTypeId: 'scg', etapeStatutId: 'fai' } },
  saisineDesCollectivitesLocales: { FAIT: { etapeTypeId: 'scl', etapeStatutId: 'fai' } },
  signatureDeLautorisationDeRechercheMiniere: { FAIT: { etapeTypeId: 'sco', etapeStatutId: 'fai' } },
  saisineDuConseilDEtat: { FAIT: { etapeTypeId: 'spe', etapeStatutId: 'fai' } },
  saisineDeLaCommissionDepartementaleDesMines_CDM_: { FAIT: { etapeTypeId: 'spo', etapeStatutId: 'fai' } },
  saisineDuPrefet: { FAIT: { etapeTypeId: 'spp', etapeStatutId: 'fai' } },
  saisineDesServices: { FAIT: { etapeTypeId: 'ssr', etapeStatutId: 'fai' } },
  validationDuPaiementDesFraisDeDossierComplementaires: { FAIT: { etapeTypeId: 'vfc', etapeStatutId: 'fai' } },
  validationDuPaiementDesFraisDeDossier: { FAIT: { etapeTypeId: 'vfd', etapeStatutId: 'fai' } },
  abandonDeLaDemande: { FAIT: { etapeTypeId: 'wab', etapeStatutId: 'fai' } },
  avisDeDirectionRegionaleDesAffairesCulturellesDRAC: {
    FAVORABLE: { etapeTypeId: 'wac', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wac', etapeStatutId: 'def' },
  },
  avisDeLaDirectionDepartementaleDesTerritoiresEtDeLaMerDDT_M_: {
    FAVORABLE: { etapeTypeId: 'wad', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wad', etapeStatutId: 'def' },
  },
  avisDeLautoriteEnvironnementale: {
    FAVORABLE: { etapeTypeId: 'wae', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wae', etapeStatutId: 'def' },
  },
  avisDesAutresInstances: {
    FAVORABLE: { etapeTypeId: 'wai', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wai', etapeStatutId: 'def' },
  },
  avisDunServiceAdministratifLocal_wal: {
    FAVORABLE: { etapeTypeId: 'wal', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wal', etapeStatutId: 'def' },
  },
  avisDeLautoriteMilitaire_wam: {
    FAVORABLE: { etapeTypeId: 'wam', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wam', etapeStatutId: 'def' },
  },
  arreteDouvertureDesTravauxMiniers: { FAIT: { etapeTypeId: 'wao', etapeStatutId: 'fai' } },
  avisDuPrefetMaritime_wap: {
    FAVORABLE: { etapeTypeId: 'wap', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wap', etapeStatutId: 'def' },
  },
  avisDeReception: { FAIT: { etapeTypeId: 'war', etapeStatutId: 'fai' } },
  avisDeLagenceRegionaleDeSanteARS: {
    FAVORABLE: { etapeTypeId: 'was', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'was', etapeStatutId: 'def' },
  },
  avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst__wat: {
    FAVORABLE: { etapeTypeId: 'wat', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wat', etapeStatutId: 'def' },
  },
  avisDuDemandeurSurLesPrescriptionsProposees: {
    FAVORABLE: { etapeTypeId: 'wau', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wau', etapeStatutId: 'def' },
  },
  clotureDeLenquetePublique_wce: { TERMINE: { etapeTypeId: 'wce', etapeStatutId: 'ter' } },
  donneActeDeLaDeclaration_DOTM_: { FAIT: { etapeTypeId: 'wda', etapeStatutId: 'fai' } },
  demandeDeComplements_AOTMOuDOTM_: { FAIT: { etapeTypeId: 'wdc', etapeStatutId: 'fai' } },
  depotDeLaDemande_wdd: { FAIT: { etapeTypeId: 'wdd', etapeStatutId: 'fai' } },
  demandeDeComplements_DADT_: { FAIT: { etapeTypeId: 'wde', etapeStatutId: 'fai' } },
  decisionDeLadministration_wdm: {
    ACCEPTE: { etapeTypeId: 'wdm', etapeStatutId: 'acc' },
    REJETE: { etapeTypeId: 'wdm', etapeStatutId: 'rej' },
  },
  demandeDautorisationDouvertureDeTravauxMiniers_AOTM_: { FAIT: { etapeTypeId: 'wfa', etapeStatutId: 'fai' } },
  declarationDarretDefinitifDeTravaux_DADT_: { FAIT: { etapeTypeId: 'wfd', etapeStatutId: 'fai' } },
  declarationDouvertureDeTravauxMiniers_DOTM_: { FAIT: { etapeTypeId: 'wfo', etapeStatutId: 'fai' } },
  demandeDautorisationDouvertureDeTravauxMiniers_DAOTM_: { DEPOSE: { etapeTypeId: 'wfr', etapeStatutId: 'dep' } },
  memoireEnReponseDeLexploitant_ParRapportALavisDeLAE_: { FAIT: { etapeTypeId: 'wmm', etapeStatutId: 'fai' } },
  memoireEnReponseDeLexploitant: { DEPOSE: { etapeTypeId: 'wmr', etapeStatutId: 'dep' } },
  memoireDeFinDeTravaux: { FAIT: { etapeTypeId: 'wmt', etapeStatutId: 'fai' } },
  ouvertureDeLenquetePublique_woe: {
    FAIT: { etapeTypeId: 'woe', etapeStatutId: 'fai' },
    PROGRAMME: { etapeTypeId: 'woe', etapeStatutId: 'pro' },
  },
  publicationDeDecisionAuRecueilDesActesAdministratifs_wpa: { FAIT: { etapeTypeId: 'wpa', etapeStatutId: 'fai' } },
  porterAConnaissance: { FAIT: { etapeTypeId: 'wpb', etapeStatutId: 'fai' } },
  arreteDePrescriptionsComplementaires: { FAIT: { etapeTypeId: 'wpc', etapeStatutId: 'fai' } },
  arreteDeSecondDonnerActe: { ACCEPTE: { etapeTypeId: 'wpo', etapeStatutId: 'acc' } },
  arretePrefectoralDePremierDonnerActe_DADT_: { FAIT: { etapeTypeId: 'wpp', etapeStatutId: 'fai' } },
  arretePrefectoralDeSursisAStatuer: { FAIT: { etapeTypeId: 'wps', etapeStatutId: 'fai' } },
  receptionDeComplements_wrc: { FAIT: { etapeTypeId: 'wrc', etapeStatutId: 'fai' } },
  rapportDeLaDreal: {
    FAVORABLE: { etapeTypeId: 'wrd', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wrd', etapeStatutId: 'def' },
  },
  recevabilite: {
    FAVORABLE: { etapeTypeId: 'wre', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wre', etapeStatutId: 'def' },
  },
  avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement_wrl: {
    FAVORABLE: { etapeTypeId: 'wrl', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wrl', etapeStatutId: 'def' },
  },
  recolement: {
    FAVORABLE: { etapeTypeId: 'wrt', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'wrt', etapeStatutId: 'def' },
  },
  saisineDeLautoriteEnvironnementale: { FAIT: { etapeTypeId: 'wse', etapeStatutId: 'fai' } },
  saisineDesServicesDeLEtat: { FAIT: { etapeTypeId: 'wss', etapeStatutId: 'fai' } },
  transmissionDuProjetDePrescriptionsAuDemandeur: { FAIT: { etapeTypeId: 'wtp', etapeStatutId: 'fai' } },
  receptionDeComplements_wco: { FAIT: { etapeTypeId: 'wco', etapeStatutId: 'fai' } },
  avisDeLaDDT_M_: { FAIT: { etapeTypeId: 'wdt', etapeStatutId: 'fai' } },
  consultationCLEDuSAGE: {
    FAVORABLE: { etapeTypeId: 'ccs', etapeStatutId: 'fav' },
    DEFAVORABLE: { etapeTypeId: 'ccs', etapeStatutId: 'def' },
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
