import { isNotNullNorUndefined, onlyUnique } from '../typescript-tools.js'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId, isDemarcheTypeId } from './demarchesTypes.js'
import { DocumentsTypes, DOCUMENTS_TYPES_IDS, DocumentType, DocumentTypeId, isDocumentTypeId } from './documentsTypes.js'
import { DomaineId, DOMAINES_IDS, isDomaineId } from './domaines.js'
import { ETAPES_TYPES, EtapeTypeId, isEtapeTypeId } from './etapesTypes.js'
import { isTitreTypeType, TITRES_TYPES_TYPES_IDS, TitreTypeTypeId } from './titresTypesTypes.js'
import { TitreTypeId, toTitreTypeId } from './titresTypes.js'

const EtapesTypesDocumentsTypes: { [key in EtapeTypeId]?: DocumentTypeId[] } = {
  [ETAPES_TYPES.avisDeDirectionRegionaleDesAffairesCulturelles]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires, DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires],
  [ETAPES_TYPES.abrogationDeLaDecision]: [DOCUMENTS_TYPES_IDS.arrete],
  [ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_]: [DOCUMENTS_TYPES_IDS.avis, DOCUMENTS_TYPES_IDS.ficheDePresentation, DOCUMENTS_TYPES_IDS.lettre],
  [ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_]: [
    DOCUMENTS_TYPES_IDS.avisDUnServiceDeLAdministrationCentrale,
    DOCUMENTS_TYPES_IDS.avisDuConseilGeneralDeLEconomie_cge,
    DOCUMENTS_TYPES_IDS.avis,
    DOCUMENTS_TYPES_IDS.rapportDeLAdministrationCentraleChargeDesMines
  ],
  [ETAPES_TYPES.avisDuneCollectiviteLocale]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avenantALautorisationDeRechercheMiniere]: [
    DOCUMENTS_TYPES_IDS.avenant,
    DOCUMENTS_TYPES_IDS.contrat,
    DOCUMENTS_TYPES_IDS.convention,
    DOCUMENTS_TYPES_IDS.decision,
    DOCUMENTS_TYPES_IDS.notificationDeDecision
  ],
  [ETAPES_TYPES.avisDeLaDirectionRegionaleDesFinancesPubliques]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires, DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDeLaGendarmerieNationale]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires],
  [ETAPES_TYPES.avisDeLIfremer]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDunMaire]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.decisionDuJugeAdministratif]: [DOCUMENTS_TYPES_IDS.decision],
  [ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF]: [DOCUMENTS_TYPES_IDS.avisDeMiseEnConcurrence, DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDeLOfficeNationalDesForets]: [
    DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires,
    DOCUMENTS_TYPES_IDS.avis,
    DOCUMENTS_TYPES_IDS.contrat,
    DOCUMENTS_TYPES_IDS.lettre,
    DOCUMENTS_TYPES_IDS.motif
  ],
  [ETAPES_TYPES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement]: [
    DOCUMENTS_TYPES_IDS.avisDuDirecteurRegionalChargeDesMines,
    DOCUMENTS_TYPES_IDS.rapportDeLAdministrationCentraleChargeDesMines,
    DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines
  ],
  [ETAPES_TYPES.avisDuConseilDEtat]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDeLetatMajorOrpaillageEtPecheIllicite_EMOPI_]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires],
  [ETAPES_TYPES.avisDunServiceAdministratifLocal]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires, DOCUMENTS_TYPES_IDS.avis, DOCUMENTS_TYPES_IDS.lettre],
  [ETAPES_TYPES.avisDeLautoriteMilitaire]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires, DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_]: [DOCUMENTS_TYPES_IDS.avisDeLaCommissionDepartementaleDesMines, DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines],
  [ETAPES_TYPES.avisDuPrefet]: [DOCUMENTS_TYPES_IDS.avisDuPrefet, DOCUMENTS_TYPES_IDS.lettre, DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines],
  [ETAPES_TYPES.publicationDeLavisDeDecisionImplicite]: [DOCUMENTS_TYPES_IDS.avis, DOCUMENTS_TYPES_IDS.notes],
  [ETAPES_TYPES.avisDuPrefetMaritime]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDeLagenceRegionaleDeSante]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires, DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.decisionDuProprietaireDuSol]: [DOCUMENTS_TYPES_IDS.decision, DOCUMENTS_TYPES_IDS.lettre],
  [ETAPES_TYPES.avisDeLaCaisseGeneraleDeSecuriteSociale]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires],
  [ETAPES_TYPES.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires],
  [ETAPES_TYPES.consultationDesAdministrationsCentrales]: [DOCUMENTS_TYPES_IDS.avis, DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesDeLAdministrationCentrale],
  [ETAPES_TYPES.classementSansSuite]: [DOCUMENTS_TYPES_IDS.arrete, DOCUMENTS_TYPES_IDS.lettre, DOCUMENTS_TYPES_IDS.notes, DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines],
  [ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_]: [
    DOCUMENTS_TYPES_IDS.arretePrefectoral,
    DOCUMENTS_TYPES_IDS.arrete,
    DOCUMENTS_TYPES_IDS.decisionCasParCas,
    DOCUMENTS_TYPES_IDS.lettre,
    DOCUMENTS_TYPES_IDS.notificationDeDecision
  ],
  [ETAPES_TYPES.desistementDuDemandeur]: [
    DOCUMENTS_TYPES_IDS.accuseDeReceptionDUneDemande,
    DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande,
    DOCUMENTS_TYPES_IDS.lettre,
    DOCUMENTS_TYPES_IDS.motif,
    DOCUMENTS_TYPES_IDS.notes
  ],
  [ETAPES_TYPES.decisionDeLadministration]: [
    DOCUMENTS_TYPES_IDS.arreteMinisteriel,
    DOCUMENTS_TYPES_IDS.arretePrefectoral,
    DOCUMENTS_TYPES_IDS.arrete,
    DOCUMENTS_TYPES_IDS.cahierDesCharges,
    DOCUMENTS_TYPES_IDS.courrierDeNotificationDeLaRecevabilite,
    DOCUMENTS_TYPES_IDS.contrat,
    DOCUMENTS_TYPES_IDS.convention,
    DOCUMENTS_TYPES_IDS.decret,
    DOCUMENTS_TYPES_IDS.decision,
    DOCUMENTS_TYPES_IDS.notificationDeDecision,
    DOCUMENTS_TYPES_IDS.ordonnanceDuRoi,
    DOCUMENTS_TYPES_IDS.ordonnance,
    DOCUMENTS_TYPES_IDS.documentsCartographiques
  ],
  [ETAPES_TYPES.publicationDeDecisionAuJORF]: [
    DOCUMENTS_TYPES_IDS.arreteMinisteriel,
    DOCUMENTS_TYPES_IDS.arrete,
    DOCUMENTS_TYPES_IDS.cahierDesCharges,
    DOCUMENTS_TYPES_IDS.convention,
    DOCUMENTS_TYPES_IDS.decret,
    DOCUMENTS_TYPES_IDS.decision,
    DOCUMENTS_TYPES_IDS.ordonnance,
    DOCUMENTS_TYPES_IDS.publicationAuJorf
  ],
  [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: [DOCUMENTS_TYPES_IDS.arrete, DOCUMENTS_TYPES_IDS.publicationAuJorf],
  [ETAPES_TYPES.decisionAdministrative]: [DOCUMENTS_TYPES_IDS.arrete],
  [ETAPES_TYPES.expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_]: [DOCUMENTS_TYPES_IDS.avis, DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines],
  [ETAPES_TYPES.expertiseDeLOfficeNationalDesForets]: [DOCUMENTS_TYPES_IDS.lettre, DOCUMENTS_TYPES_IDS.motif, DOCUMENTS_TYPES_IDS.notes],
  [ETAPES_TYPES.clotureDeLenquetePublique]: [DOCUMENTS_TYPES_IDS.notes, DOCUMENTS_TYPES_IDS.rapportDuCommissaireEnqueteur],
  [ETAPES_TYPES.ouvertureDeLenquetePublique]: [
    DOCUMENTS_TYPES_IDS.avisDEnquetePublique,
    DOCUMENTS_TYPES_IDS.arretePrefectoral,
    DOCUMENTS_TYPES_IDS.lettre,
    DOCUMENTS_TYPES_IDS.notes,
    DOCUMENTS_TYPES_IDS.publicationAuJorf
  ],
  [ETAPES_TYPES.demandeDeComplements_RecevabiliteDeLaDemande_]: [DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements, DOCUMENTS_TYPES_IDS.lettreDeDemande],
  [ETAPES_TYPES.demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_]: [
    DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements,
    DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande,
    DOCUMENTS_TYPES_IDS.dossierLoiSurLEau,
    DOCUMENTS_TYPES_IDS.lettre
  ],
  [ETAPES_TYPES.demandeDeComplements]: [DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements, DOCUMENTS_TYPES_IDS.lettre, DOCUMENTS_TYPES_IDS.rapportDeRecevabilite],
  [ETAPES_TYPES.completudeDeLaDemande]: [DOCUMENTS_TYPES_IDS.ficheDeCompletude],
  [ETAPES_TYPES.recevabiliteDeLaDemande]: [
    DOCUMENTS_TYPES_IDS.courrierDeNotificationDeLaRecevabilite,
    DOCUMENTS_TYPES_IDS.facture,
    DOCUMENTS_TYPES_IDS.lettre,
    DOCUMENTS_TYPES_IDS.notes,
    DOCUMENTS_TYPES_IDS.rapportDeRecevabilite,
    DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines
  ],
  [ETAPES_TYPES.depotDeLaDemande]: [DOCUMENTS_TYPES_IDS.accuseDeReceptionDUneDemande],
  [ETAPES_TYPES.demande]: [
    DOCUMENTS_TYPES_IDS.contratDAmodiation,
    DOCUMENTS_TYPES_IDS.documentsCartographiques,
    DOCUMENTS_TYPES_IDS.contrat,
    DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande,
    DOCUMENTS_TYPES_IDS.decisionCasParCas,
    DOCUMENTS_TYPES_IDS.dossierLoiSurLEau,
    DOCUMENTS_TYPES_IDS.dossierDeDemande,
    DOCUMENTS_TYPES_IDS.dossier,
    DOCUMENTS_TYPES_IDS.facture,
    DOCUMENTS_TYPES_IDS.ficheDeCompletude,
    DOCUMENTS_TYPES_IDS.ficheDePresentation,
    DOCUMENTS_TYPES_IDS.formulaireDeDemande,
    DOCUMENTS_TYPES_IDS.justificatifDePaiement,
    DOCUMENTS_TYPES_IDS.lettreDeDemande,
    DOCUMENTS_TYPES_IDS.lettre,
    DOCUMENTS_TYPES_IDS.noticeDIncidence,
    DOCUMENTS_TYPES_IDS.recepisse_LoiSurLEau
  ],
  [ETAPES_TYPES.demandeDinformations]: [DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements],
  [ETAPES_TYPES.notificationAuDemandeur_AjournementDeLaCARM_]: [DOCUMENTS_TYPES_IDS.lettre],
  [ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_]: [DOCUMENTS_TYPES_IDS.lettre, DOCUMENTS_TYPES_IDS.notificationDeDecision],
  [ETAPES_TYPES.notificationAuDemandeur_AvisDefavorable_]: [DOCUMENTS_TYPES_IDS.decision, DOCUMENTS_TYPES_IDS.lettre, DOCUMENTS_TYPES_IDS.notificationDeDecision],
  [ETAPES_TYPES.notificationAuDemandeur]: [DOCUMENTS_TYPES_IDS.avis, DOCUMENTS_TYPES_IDS.notificationDeDecision],
  [ETAPES_TYPES.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_]: [DOCUMENTS_TYPES_IDS.lettre],
  [ETAPES_TYPES.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_]: [
    DOCUMENTS_TYPES_IDS.avenant,
    DOCUMENTS_TYPES_IDS.contrat,
    DOCUMENTS_TYPES_IDS.lettre,
    DOCUMENTS_TYPES_IDS.notificationDeDecision
  ],
  [ETAPES_TYPES.modificationDeLaDemande]: [
    DOCUMENTS_TYPES_IDS.accuseDeReceptionDUneDemande,
    DOCUMENTS_TYPES_IDS.documentsCartographiques,
    DOCUMENTS_TYPES_IDS.dossierLoiSurLEau,
    DOCUMENTS_TYPES_IDS.lettreDeDemande,
    DOCUMENTS_TYPES_IDS.lettre,
    DOCUMENTS_TYPES_IDS.notificationDeDecision,
    DOCUMENTS_TYPES_IDS.notes
  ],
  [ETAPES_TYPES.noteInterneSignalee]: [DOCUMENTS_TYPES_IDS.arreteMinisteriel],
  [ETAPES_TYPES.paiementDesFraisDeDossierComplementaires]: [DOCUMENTS_TYPES_IDS.facture],
  [ETAPES_TYPES.paiementDesFraisDeDossier]: [DOCUMENTS_TYPES_IDS.facture, DOCUMENTS_TYPES_IDS.justificatifDePaiement, DOCUMENTS_TYPES_IDS.notes],
  [ETAPES_TYPES.avisDuParcNaturelRegional]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.clotureDeLaParticipationDuPublic]: [DOCUMENTS_TYPES_IDS.notes, DOCUMENTS_TYPES_IDS.rapportDuCommissaireEnqueteur],
  [ETAPES_TYPES.ouvertureDeLaParticipationDuPublic]: [
    DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande,
    DOCUMENTS_TYPES_IDS.documentsCartographiques,
    DOCUMENTS_TYPES_IDS.dossierDeDemande,
    DOCUMENTS_TYPES_IDS.dossier,
    DOCUMENTS_TYPES_IDS.lettreDeDemande,
    DOCUMENTS_TYPES_IDS.notes
  ],
  [ETAPES_TYPES.receptionDeComplements_RecevabiliteDeLaDemande_]: [DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande],
  [ETAPES_TYPES.receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_]: [DOCUMENTS_TYPES_IDS.documentsCartographiques, DOCUMENTS_TYPES_IDS.dossierLoiSurLEau],
  [ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_]: [
    DOCUMENTS_TYPES_IDS.avisDuConseilGeneralDeLEconomie_cge,
    DOCUMENTS_TYPES_IDS.avis,
    DOCUMENTS_TYPES_IDS.notes,
    DOCUMENTS_TYPES_IDS.rapportDeLAdministrationCentraleChargeDesMines
  ],
  [ETAPES_TYPES.receptionDeComplements_CompletudeDeLaDemande_]: [
    DOCUMENTS_TYPES_IDS.documentsCartographiques,
    DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande,
    DOCUMENTS_TYPES_IDS.facture,
    DOCUMENTS_TYPES_IDS.kbis,
    DOCUMENTS_TYPES_IDS.noticeDIncidence,
    DOCUMENTS_TYPES_IDS.recepisse_LoiSurLEau
  ],
  [ETAPES_TYPES.receptionDeComplements]: [DOCUMENTS_TYPES_IDS.documentsCartographiques, DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, DOCUMENTS_TYPES_IDS.lettre],
  [ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau]: [DOCUMENTS_TYPES_IDS.arretePrefectoral, DOCUMENTS_TYPES_IDS.recepisse_LoiSurLEau],
  [ETAPES_TYPES.receptionDinformation]: [
    DOCUMENTS_TYPES_IDS.documentsCartographiques,
    DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande,
    DOCUMENTS_TYPES_IDS.lettreDeDemande,
    DOCUMENTS_TYPES_IDS.lettre,
    DOCUMENTS_TYPES_IDS.notes
  ],
  [ETAPES_TYPES.rapportDuConseilDEtat]: [DOCUMENTS_TYPES_IDS.extraitDuRegistreDesDeliberationsDeLaSectionDesTravauxPublicDuConseilDEtat],
  [ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs]: [DOCUMENTS_TYPES_IDS.arrete],
  [ETAPES_TYPES.retraitDeLaDecision]: [DOCUMENTS_TYPES_IDS.arretePrefectoral],
  [ETAPES_TYPES.saisineDeLautoriteSignataire]: [DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesDeLAdministrationCentrale, DOCUMENTS_TYPES_IDS.noteALAutoriteSignataire, DOCUMENTS_TYPES_IDS.notes],
  [ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_]: [
    DOCUMENTS_TYPES_IDS.lettreDeSaisineDuConseilGeneralDeLEconomie_cge,
    DOCUMENTS_TYPES_IDS.lettre,
    DOCUMENTS_TYPES_IDS.notes,
    DOCUMENTS_TYPES_IDS.rapportDeLAdministrationCentraleChargeDesMines,
    DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines
  ],
  [ETAPES_TYPES.saisineDesCollectivitesLocales]: [
    DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesDeLAdministrationCentrale,
    DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesCivilsEtMilitaires,
    DOCUMENTS_TYPES_IDS.lettre
  ],
  [ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere]: [DOCUMENTS_TYPES_IDS.contrat, DOCUMENTS_TYPES_IDS.convention, DOCUMENTS_TYPES_IDS.lettre],
  [ETAPES_TYPES.saisineDuConseilDEtat]: [DOCUMENTS_TYPES_IDS.lettreDeSaisineDuConseilDEtat],
  [ETAPES_TYPES.saisineDuPrefet]: [DOCUMENTS_TYPES_IDS.lettre, DOCUMENTS_TYPES_IDS.lettreDeSaisineDuPrefet],
  [ETAPES_TYPES.saisineDesServices]: [DOCUMENTS_TYPES_IDS.avisDesServicesCivilsEtMilitaires, DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesCivilsEtMilitaires, DOCUMENTS_TYPES_IDS.lettre],
  [ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires]: [DOCUMENTS_TYPES_IDS.facture],
  [ETAPES_TYPES.validationDuPaiementDesFraisDeDossier]: [DOCUMENTS_TYPES_IDS.facture, DOCUMENTS_TYPES_IDS.justificatifDePaiement],
  [ETAPES_TYPES.abandonDeLaDemande]: [DOCUMENTS_TYPES_IDS.courrier],
  [ETAPES_TYPES.avisDeDirectionRegionaleDesAffairesCulturellesDRAC]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDeLaDirectionDepartementaleDesTerritoiresEtDeLaMerDDT_M_]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDeLautoriteEnvironnementale]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDesAutresInstances]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDunServiceAdministratifLocal_wal]: [DOCUMENTS_TYPES_IDS.avis, DOCUMENTS_TYPES_IDS.courrier],
  [ETAPES_TYPES.avisDeLautoriteMilitaire_wam]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.arreteDouvertureDesTravauxMiniers]: [DOCUMENTS_TYPES_IDS.arretePrefectoral],
  [ETAPES_TYPES.avisDuPrefetMaritime_wap]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDeReception]: [DOCUMENTS_TYPES_IDS.courrierDeNotificationDeLaRecevabilite, DOCUMENTS_TYPES_IDS.lettreDeSaisineDuPrefet],
  [ETAPES_TYPES.avisDeLagenceRegionaleDeSanteARS]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst__wat]: [DOCUMENTS_TYPES_IDS.avis],
  [ETAPES_TYPES.avisDuDemandeurSurLesPrescriptionsProposees]: [DOCUMENTS_TYPES_IDS.avis, DOCUMENTS_TYPES_IDS.courrier],
  [ETAPES_TYPES.clotureDeLenquetePublique_wce]: [DOCUMENTS_TYPES_IDS.rapportDuCommissaireEnqueteur],
  [ETAPES_TYPES.donneActeDeLaDeclaration_DOTM_]: [DOCUMENTS_TYPES_IDS.projetDePrescriptions],
  [ETAPES_TYPES.demandeDeComplements_AOTMOuDOTM_]: [DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements, DOCUMENTS_TYPES_IDS.rapportDreal],
  [ETAPES_TYPES.depotDeLaDemande_wdd]: [DOCUMENTS_TYPES_IDS.dossierDeDemande],
  [ETAPES_TYPES.demandeDeComplements_DADT_]: [DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements],
  [ETAPES_TYPES.decisionDeLadministration_wdm]: [DOCUMENTS_TYPES_IDS.arreteDeRefus, DOCUMENTS_TYPES_IDS.courrier],
  [ETAPES_TYPES.demandeDautorisationDouvertureDeTravauxMiniers_AOTM_]: [DOCUMENTS_TYPES_IDS.dossierDeDemande],
  [ETAPES_TYPES.declarationDarretDefinitifDeTravaux_DADT_]: [DOCUMENTS_TYPES_IDS.declaration, DOCUMENTS_TYPES_IDS.dossier],
  [ETAPES_TYPES.declarationDouvertureDeTravauxMiniers_DOTM_]: [DOCUMENTS_TYPES_IDS.declaration],
  [ETAPES_TYPES.demandeDautorisationDouvertureDeTravauxMiniers_DAOTM_]: [
    DOCUMENTS_TYPES_IDS.accuseDeReceptionDUneDemande,
    DOCUMENTS_TYPES_IDS.documentsCartographiques,
    DOCUMENTS_TYPES_IDS.dossierDeDemande,
    DOCUMENTS_TYPES_IDS.dossier,
    DOCUMENTS_TYPES_IDS.ficheDePresentation,
    DOCUMENTS_TYPES_IDS.identificationDeMateriel,
    DOCUMENTS_TYPES_IDS.noticeDIncidence
  ],
  [ETAPES_TYPES.memoireEnReponseDeLexploitant_ParRapportALavisDeLAE_]: [DOCUMENTS_TYPES_IDS.dossier],
  [ETAPES_TYPES.memoireEnReponseDeLexploitant]: [DOCUMENTS_TYPES_IDS.dossier],
  [ETAPES_TYPES.memoireDeFinDeTravaux]: [DOCUMENTS_TYPES_IDS.programmeDesTravaux],
  [ETAPES_TYPES.ouvertureDeLenquetePublique_woe]: [DOCUMENTS_TYPES_IDS.arretePrefectoral, DOCUMENTS_TYPES_IDS.rapportDuCommissaireEnqueteur],
  [ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs_wpa]: [DOCUMENTS_TYPES_IDS.arretePrefectoral],
  [ETAPES_TYPES.porterAConnaissance]: [DOCUMENTS_TYPES_IDS.documentsCartographiques, DOCUMENTS_TYPES_IDS.courrier],
  [ETAPES_TYPES.arreteDePrescriptionsComplementaires]: [DOCUMENTS_TYPES_IDS.arretePrefectoral],
  [ETAPES_TYPES.arreteDeSecondDonnerActe]: [DOCUMENTS_TYPES_IDS.arreteDeSecondDonneActe_ap2],
  [ETAPES_TYPES.arretePrefectoralDePremierDonnerActe_DADT_]: [DOCUMENTS_TYPES_IDS.arreteDePremierDonneActe_ap1, DOCUMENTS_TYPES_IDS.rapport],
  [ETAPES_TYPES.arretePrefectoralDeSursisAStatuer]: [DOCUMENTS_TYPES_IDS.arretePrefectoral],
  [ETAPES_TYPES.receptionDeComplements_wrc]: [DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, DOCUMENTS_TYPES_IDS.documentsCartographiques],
  [ETAPES_TYPES.rapportDeLaDreal]: [DOCUMENTS_TYPES_IDS.projetDePrescriptions, DOCUMENTS_TYPES_IDS.rapport],
  [ETAPES_TYPES.recevabilite]: [DOCUMENTS_TYPES_IDS.avis, DOCUMENTS_TYPES_IDS.courrierDeNotificationDeLaRecevabilite, DOCUMENTS_TYPES_IDS.rapportDeRecevabilite],
  [ETAPES_TYPES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement_wrl]: [DOCUMENTS_TYPES_IDS.rapport],
  [ETAPES_TYPES.recolement]: [DOCUMENTS_TYPES_IDS.pvDeRecolement],
  [ETAPES_TYPES.saisineDeLautoriteEnvironnementale]: [DOCUMENTS_TYPES_IDS.courrierDeSaisineDuPrefet, DOCUMENTS_TYPES_IDS.lettreDeSaisineDuPrefet],
  [ETAPES_TYPES.saisineDesServicesDeLEtat]: [DOCUMENTS_TYPES_IDS.courrierDeSaisineDuPrefet],
  [ETAPES_TYPES.transmissionDuProjetDePrescriptionsAuDemandeur]: [DOCUMENTS_TYPES_IDS.arretePrefectoral]
}

const TDEDocumentsTypes: {
  [key in TitreTypeTypeId]?: { [key in DomaineId]?: { [key in DemarcheTypeId]?: { [key in EtapeTypeId]?: { [key in DocumentTypeId]?: { optionnel: boolean; description?: string } } } } }
} = {
  [TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE]: {
    [DOMAINES_IDS.METAUX]: {
      [DEMARCHES_TYPES_IDS.Octroi]: {
        [ETAPES_TYPES.demande]: {
          [DOCUMENTS_TYPES_IDS.decisionCasParCas]: { optionnel: true },
          [DOCUMENTS_TYPES_IDS.dossierLoiSurLEau]: { optionnel: true },
          [DOCUMENTS_TYPES_IDS.dossierDeDemande]: { optionnel: false },
          [DOCUMENTS_TYPES_IDS.formulaireDeDemande]: { optionnel: false },
          [DOCUMENTS_TYPES_IDS.justificatifDePaiement]: { optionnel: false },
          [DOCUMENTS_TYPES_IDS.documentsCartographiques]: { optionnel: false }
        }
      }
    }
  },
  [TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES]: {
    [DOMAINES_IDS.GEOTHERMIE]: { [DEMARCHES_TYPES_IDS.MutationPartielle]: { [ETAPES_TYPES.decisionDeLadministration]: { [DOCUMENTS_TYPES_IDS.arrete]: { optionnel: true } } } }
  },
  [TITRES_TYPES_TYPES_IDS.CONCESSION]: { [DOMAINES_IDS.METAUX]: { [DEMARCHES_TYPES_IDS.Renonciation]: { [ETAPES_TYPES.decisionImplicite]: { [DOCUMENTS_TYPES_IDS.courrier]: { optionnel: true } } } } },
  [TITRES_TYPES_TYPES_IDS.AUTORISATION_D_EXPLOITATION]: {
    [DOMAINES_IDS.METAUX]: {
      [DEMARCHES_TYPES_IDS.Octroi]: {
        [ETAPES_TYPES.decisionDuProprietaireDuSol]: { [DOCUMENTS_TYPES_IDS.lettre]: { optionnel: false, description: "Avis suite à la demande d'accord du propriétaire du sol" } },
        [ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_]: { [DOCUMENTS_TYPES_IDS.arretePrefectoral]: { optionnel: false } },
        [ETAPES_TYPES.demande]: {
          [DOCUMENTS_TYPES_IDS.documentsCartographiques]: { optionnel: false, description: 'Plan à l’échelle 1/50 000ème ou 1/100 000ème' },
          [DOCUMENTS_TYPES_IDS.identificationDeMateriel]: {
            optionnel: false,
            description:
              'la liste et la valeur du matériel d’extraction et de\n traitement que le demandeur détient ou qu’il \nenvisage d’acquérir ainsi que, dans ce dernier\n cas, le financement correspondant. Ces pièces \nsont demandées au titre de la justification des \ncapacités financières du\ndemandeur \n(décret 2001-204, art. 7)'
          },
          [DOCUMENTS_TYPES_IDS.justificationDExistenceDuGisement]: { optionnel: true },
          [DOCUMENTS_TYPES_IDS.lettre]: { optionnel: true },
          [DOCUMENTS_TYPES_IDS.mesuresPrevuesPourRehabiliterLeSite]: {
            optionnel: false,
            description:
              'la définition des mesures prévues par le pétitionnaire pour réhabiliter le site après exploitation, notamment la nature et les modalités de revégétalisation envisagée. (décret 2001-204, art. 5 bis)'
          },
          [DOCUMENTS_TYPES_IDS.methodesPourLExecutionDesTravaux]: { optionnel: false, description: 'descriptif des méthodes envisagées pour l’exécution des travaux ((décret 2001-204, art. 6)' },
          [DOCUMENTS_TYPES_IDS.noticeDImpact]: { optionnel: true },
          [DOCUMENTS_TYPES_IDS.noticeDImpactRenforcee]: { optionnel: true, description: 'Obligatoire pour les AEX hors de la zone 2 du SDOM' },
          [DOCUMENTS_TYPES_IDS.programmeDesTravaux]: { optionnel: false, description: 'Description du phasage et planigramme des travaux. (décret 2001-204, art. 5)' },
          [DOCUMENTS_TYPES_IDS.schemaDePenetrationDuMassifForestier]: {
            optionnel: false,
            description: "le schéma de pénétration du massif forestier proposé par le pétitionnaire pour l'acheminement du matériel lourd et la desserte du chantier (décret 2001-204, art. 5 bis)"
          }
        }
      }
    }
  }
} as const

export const toDocuments = (): { etapeTypeId: EtapeTypeId; documentTypeId: DocumentTypeId; optionnel: boolean; description: string | null }[] => {
  return Object.entries(EtapesTypesDocumentsTypes).flatMap(([key, values]) => {
    if (isEtapeTypeId(key)) {
      return values.map(value => ({ etapeTypeId: key, documentTypeId: value, description: null, optionnel: true }))
    } else {
      return []
    }
  })
}

export const toSpecificDocuments = (): {
  titreTypeId?: TitreTypeId
  demarcheTypeId?: DemarcheTypeId
  etapeTypeId?: EtapeTypeId
  documentTypeId: DocumentTypeId
  optionnel: boolean
  description?: string | undefined
}[] => {
  return Object.entries(TDEDocumentsTypes)
    .flatMap(([titreTypeTypeId, domaines]) => {
      return Object.entries(domaines).flatMap(([domaineId, demarcheTypeIds]) => {
        return Object.entries(demarcheTypeIds).flatMap(([demarcheTypeId, etapeTypeIds]) => {
          return Object.entries(etapeTypeIds).flatMap(([etapeTypeId, documentTypeIds]) => {
            return Object.entries(documentTypeIds).flatMap(([documentTypeId, documentType]) => {
              if (isDomaineId(domaineId) && isTitreTypeType(titreTypeTypeId) && isEtapeTypeId(etapeTypeId) && isDocumentTypeId(documentTypeId) && isDemarcheTypeId(demarcheTypeId)) {
                const titreTypeId = toTitreTypeId(titreTypeTypeId, domaineId)

                return {
                  ...documentType,
                  titreTypeId,
                  demarcheTypeId,
                  etapeTypeId,
                  documentTypeId
                }
              } else {
                return null
              }
            })
          })
        })
      })
    })
    .filter(isNotNullNorUndefined)
}
export const getDocuments = (titreTypeType?: TitreTypeTypeId, domaineId?: DomaineId, demarcheId?: DemarcheTypeId, etapeTypeId?: EtapeTypeId): DocumentType[] => {
  if (isNotNullNorUndefined(domaineId) && isNotNullNorUndefined(titreTypeType) && isNotNullNorUndefined(demarcheId) && isNotNullNorUndefined(etapeTypeId)) {
    const documentsIds = EtapesTypesDocumentsTypes[etapeTypeId] ?? []
    documentsIds.push(...Object.keys(TDEDocumentsTypes[titreTypeType]?.[domaineId]?.[demarcheId]?.[etapeTypeId] ?? {}).filter(isDocumentTypeId))

    return documentsIds.filter(onlyUnique).map(documentTypeId => {
      const documentSpecifique = TDEDocumentsTypes[titreTypeType]?.[domaineId]?.[demarcheId]?.[etapeTypeId]?.[documentTypeId]
      const document = { ...DocumentsTypes[documentTypeId], optionnel: true }
      if (documentSpecifique) {
        document.optionnel = documentSpecifique.optionnel
        document.description = documentSpecifique.description ?? document.description
      }

      return document
    })
  } else {
    throw new Error(`il manque des éléments pour trouver les documents domaineId: '${domaineId}', titreTypeType: ${titreTypeType}, demarcheId: ${demarcheId}, etapeTypeId: ${etapeTypeId}`)
  }
}
