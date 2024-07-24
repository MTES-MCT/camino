import { isNotNullNorUndefined } from '../../typescript-tools'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from './../demarchesTypes'
import { DocumentsTypes, DOCUMENTS_TYPES_IDS, DocumentType, DocumentTypeId, isDocumentTypeId } from './../documentsTypes'
import { ETAPES_TYPES, EtapeTypeId, isEtapeTypeId } from './../etapesTypes'
import { TitreTypeId, TITRES_TYPES_IDS } from './../titresTypes'
import { TDEType } from './index'

const EtapesTypesDocumentsTypes = {
  [ETAPES_TYPES.avisDunPresidentDEPCI]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true }],
  [ETAPES_TYPES.abrogationDeLaDecision]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.arrete, optionnel: true }],
  [ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.ficheDePresentation, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
  ],
  [ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avisDUnServiceDeLAdministrationCentrale, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.avisDuConseilGeneralDeLEconomie_cge, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLAdministrationCentraleChargeDesMines, optionnel: true },
  ],
  [ETAPES_TYPES.avisDuneCollectiviteLocale]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true }],
  [ETAPES_TYPES.avenantALautorisationDeRechercheMiniere]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avenant, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.contrat, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.convention, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.decision, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notificationDeDecision, optionnel: true },
  ],
  [ETAPES_TYPES.avisDunMaire]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true }],
  [ETAPES_TYPES.decisionDuJugeAdministratif]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.decision, optionnel: true }],
  [ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avisDeMiseEnConcurrence, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true },
  ],
  [ETAPES_TYPES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avisDuDirecteurRegionalChargeDesMines, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLAdministrationCentraleChargeDesMines, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines, optionnel: true },
  ],
  [ETAPES_TYPES.avisDuConseilDEtat]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true }],
  [ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avisDeLaCommissionDepartementaleDesMines, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines, optionnel: true },
  ],
  [ETAPES_TYPES.avisDuPrefet]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avisDuPrefet, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines, optionnel: true },
  ],
  [ETAPES_TYPES.publicationDeLavisDeDecisionImplicite]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
  ],
  [ETAPES_TYPES.avisDuPrefetMaritime]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true }],
  [ETAPES_TYPES.decisionDuProprietaireDuSol]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.decision, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
  ],
  [ETAPES_TYPES.consultationDesAdministrationsCentrales]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesDeLAdministrationCentrale, optionnel: true },
  ],
  [ETAPES_TYPES.classementSansSuite]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.arrete, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines, optionnel: true },
  ],
  [ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.arretePrefectoral, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.arrete, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.decisionCasParCas, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notificationDeDecision, optionnel: true },
  ],
  [ETAPES_TYPES.desistementDuDemandeur]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.accuseDeReceptionDUneDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.motif, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
  ],
  [ETAPES_TYPES.decisionDeLadministration]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.arreteMinisteriel, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.arretePrefectoral, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.arrete, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.cahierDesCharges, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeNotificationDeLaRecevabilite, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.contrat, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.convention, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.decret, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.decision, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notificationDeDecision, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.ordonnanceDuRoi, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.ordonnance, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
  ],
  [ETAPES_TYPES.publicationDeDecisionAuJORF]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.arreteMinisteriel, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.arrete, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.cahierDesCharges, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.convention, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.decret, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.decision, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.ordonnance, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.publicationAuJorf, optionnel: true },
  ],
  [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.arrete, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.publicationAuJorf, optionnel: true },
  ],
  [ETAPES_TYPES.decisionAdministrative]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.arrete, optionnel: true }],
  [ETAPES_TYPES.expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines, optionnel: true },
  ],
  [ETAPES_TYPES.clotureDeLenquetePublique]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDuCommissaireEnqueteur, optionnel: true },
  ],
  [ETAPES_TYPES.ouvertureDeLenquetePublique]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avisDEnquetePublique, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.arretePrefectoral, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.publicationAuJorf, optionnel: true },
  ],
  [ETAPES_TYPES.demandeDeComplements_RecevabiliteDeLaDemande_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeDemande, optionnel: true },
  ],
  [ETAPES_TYPES.demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossierLoiSurLEau, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
  ],
  [ETAPES_TYPES.demandeDeComplements]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeRecevabilite, optionnel: true },
  ],
  [ETAPES_TYPES.completudeDeLaDemande]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.ficheDeCompletude, optionnel: true }],
  [ETAPES_TYPES.recevabiliteDeLaDemande]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeNotificationDeLaRecevabilite, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.facture, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeRecevabilite, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines, optionnel: true },
  ],
  [ETAPES_TYPES.depotDeLaDemande]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.accuseDeReceptionDUneDemande, optionnel: true }],
  [ETAPES_TYPES.demande]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.contratDAmodiation, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.contrat, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.decisionCasParCas, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossierLoiSurLEau, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossier, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.facture, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.ficheDeCompletude, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.ficheDePresentation, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.formulaireDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.justificatifDePaiement, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.noticeDIncidence, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.recepisse_LoiSurLEau, optionnel: true },
  ],
  [ETAPES_TYPES.demandeDinformations]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements, optionnel: true }],
  [ETAPES_TYPES.notificationAuDemandeur_AjournementDeLaCARM_]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true }],
  [ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notificationDeDecision, optionnel: true },
  ],
  [ETAPES_TYPES.notificationAuDemandeur_AvisDefavorable_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.decision, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notificationDeDecision, optionnel: true },
  ],
  [ETAPES_TYPES.notificationAuDemandeur]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notificationDeDecision, optionnel: true },
  ],
  [ETAPES_TYPES.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true }],
  [ETAPES_TYPES.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avenant, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.contrat, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notificationDeDecision, optionnel: true },
  ],
  [ETAPES_TYPES.modificationDeLaDemande]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.accuseDeReceptionDUneDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossierLoiSurLEau, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notificationDeDecision, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
  ],
  [ETAPES_TYPES.noteInterneSignalee]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.arreteMinisteriel, optionnel: true }],
  [ETAPES_TYPES.paiementDesFraisDeDossierComplementaires]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.facture, optionnel: true }],
  [ETAPES_TYPES.paiementDesFraisDeDossier]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.facture, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.justificatifDePaiement, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
  ],
  [ETAPES_TYPES.participationDuPublic]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossier, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDuCommissaireEnqueteur, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
  ],
  [ETAPES_TYPES.receptionDeComplements_RecevabiliteDeLaDemande_]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, optionnel: true }],
  [ETAPES_TYPES.receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossierLoiSurLEau, optionnel: true },
  ],
  [ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avisDuConseilGeneralDeLEconomie_cge, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLAdministrationCentraleChargeDesMines, optionnel: true },
  ],
  [ETAPES_TYPES.receptionDeComplements_CompletudeDeLaDemande_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.facture, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.kbis, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.noticeDIncidence, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.recepisse_LoiSurLEau, optionnel: true },
  ],
  [ETAPES_TYPES.receptionDeComplements]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
  ],
  [ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.arretePrefectoral, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.recepisse_LoiSurLEau, optionnel: true },
  ],
  [ETAPES_TYPES.receptionDinformation]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
  ],
  [ETAPES_TYPES.rapportDuConseilDEtat]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.extraitDuRegistreDesDeliberationsDeLaSectionDesTravauxPublicDuConseilDEtat, optionnel: true }],
  [ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.arrete, optionnel: true }],
  [ETAPES_TYPES.saisineDeLautoriteSignataire]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesDeLAdministrationCentrale, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.noteALAutoriteSignataire, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
  ],
  [ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeSaisineDuConseilGeneralDeLEconomie_cge, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.notes, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLAdministrationCentraleChargeDesMines, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeLaDirectionRegionaleChargeeDesMines, optionnel: true },
  ],
  [ETAPES_TYPES.saisineDesCollectivitesLocales]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesDeLAdministrationCentrale, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesCivilsEtMilitaires, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
  ],
  [ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.contrat, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.convention, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
  ],
  [ETAPES_TYPES.saisineDuConseilDEtat]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeSaisineDuConseilDEtat, optionnel: true }],
  [ETAPES_TYPES.saisineDuPrefet]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettre, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeSaisineDuPrefet, optionnel: true },
  ],
  [ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.facture, optionnel: true }],
  [ETAPES_TYPES.validationDuPaiementDesFraisDeDossier]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.facture, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.justificatifDePaiement, optionnel: true },
  ],
  [ETAPES_TYPES.abandonDeLaDemande]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.courrier, optionnel: true }],
  [ETAPES_TYPES.avisDeLautoriteEnvironnementale]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true }],
  [ETAPES_TYPES.arreteDouvertureDesTravauxMiniers]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.arretePrefectoral, optionnel: true }],
  [ETAPES_TYPES.avisDuPrefetMaritime_wap]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true }],
  [ETAPES_TYPES.avisDeReception]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeNotificationDeLaRecevabilite, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeSaisineDuPrefet, optionnel: true },
  ],
  [ETAPES_TYPES.avisDuDemandeurSurLesPrescriptionsProposees]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrier, optionnel: true },
  ],
  [ETAPES_TYPES.clotureDeLenquetePublique_wce]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.rapportDuCommissaireEnqueteur, optionnel: true }],
  [ETAPES_TYPES.donneActeDeLaDeclaration_DOTM_]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.projetDePrescriptions, optionnel: true }],
  [ETAPES_TYPES.demandeDeComplements_AOTMOuDOTM_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDreal, optionnel: true },
  ],
  [ETAPES_TYPES.depotDeLaDemande_wdd]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.dossierDeDemande, optionnel: true }],
  [ETAPES_TYPES.demandeDeComplements_DADT_]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeDemandeDeComplements, optionnel: true }],
  [ETAPES_TYPES.decisionDeLadministration_wdm]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.arreteDeRefus, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrier, optionnel: true },
  ],
  [ETAPES_TYPES.demandeDautorisationDouvertureDeTravauxMiniers_AOTM_]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.dossierDeDemande, optionnel: true }],
  [ETAPES_TYPES.declarationDarretDefinitifDeTravaux_DADT_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.declaration, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossier, optionnel: true },
  ],
  [ETAPES_TYPES.declarationDouvertureDeTravauxMiniers_DOTM_]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.declaration, optionnel: true }],
  [ETAPES_TYPES.demandeDautorisationDouvertureDeTravauxMiniers_DAOTM_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.accuseDeReceptionDUneDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.dossier, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.ficheDePresentation, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.identificationDeMateriel, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.noticeDIncidence, optionnel: true },
  ],
  [ETAPES_TYPES.memoireEnReponseDeLexploitant_ParRapportALavisDeLAE_]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.dossier, optionnel: true }],
  [ETAPES_TYPES.memoireEnReponseDeLexploitant]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.dossier, optionnel: true }],
  [ETAPES_TYPES.memoireDeFinDeTravaux]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.programmeDesTravaux, optionnel: true }],
  [ETAPES_TYPES.ouvertureDeLenquetePublique_woe]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.arretePrefectoral, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDuCommissaireEnqueteur, optionnel: true },
  ],
  [ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs_wpa]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.arretePrefectoral, optionnel: true }],
  [ETAPES_TYPES.porterAConnaissance]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrier, optionnel: true },
  ],
  [ETAPES_TYPES.arreteDePrescriptionsComplementaires]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.arretePrefectoral, optionnel: true }],
  [ETAPES_TYPES.arreteDeSecondDonnerActe]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.arreteDeSecondDonneActe_ap2, optionnel: true }],
  [ETAPES_TYPES.arretePrefectoralDePremierDonnerActe_DADT_]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.arreteDePremierDonneActe_ap1, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapport, optionnel: true },
  ],
  [ETAPES_TYPES.arretePrefectoralDeSursisAStatuer]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.arretePrefectoral, optionnel: true }],
  [ETAPES_TYPES.receptionDeComplements_wrc]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.complementsAuDossierDeDemande, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.documentsCartographiques, optionnel: true },
  ],
  [ETAPES_TYPES.rapportDeLaDreal]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.projetDePrescriptions, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapport, optionnel: true },
  ],
  [ETAPES_TYPES.recevabilite]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.avis, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeNotificationDeLaRecevabilite, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.rapportDeRecevabilite, optionnel: true },
  ],
  [ETAPES_TYPES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement_wrl]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.rapport, optionnel: true }],
  [ETAPES_TYPES.recolement]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.pvDeRecolement, optionnel: true }],
  [ETAPES_TYPES.saisineDeLautoriteEnvironnementale]: [
    { documentTypeId: DOCUMENTS_TYPES_IDS.courrierDeSaisineDuPrefet, optionnel: true },
    { documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeSaisineDuPrefet, optionnel: true },
  ],
  [ETAPES_TYPES.transmissionDuProjetDePrescriptionsAuDemandeur]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.arretePrefectoral, optionnel: true }],
  [ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesCivilsEtMilitaires, optionnel: false }],
} as const satisfies { [key in EtapeTypeId]?: (DocumentTypeId | { documentTypeId: DocumentTypeId; optionnel: boolean })[] }

const isEtapesTypesEtapesTypesDocumentsTypes = (etapeTypeId?: EtapeTypeId): etapeTypeId is keyof typeof EtapesTypesDocumentsTypes => {
  return Object.keys(EtapesTypesDocumentsTypes).includes(etapeTypeId)
}

const TDEDocumentsTypes = {
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: {
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: {
        [DOCUMENTS_TYPES_IDS.decisionCasParCas]: { optionnel: true },
        [DOCUMENTS_TYPES_IDS.dossierLoiSurLEau]: { optionnel: true },
        [DOCUMENTS_TYPES_IDS.dossierDeDemande]: { optionnel: false },
        [DOCUMENTS_TYPES_IDS.formulaireDeDemande]: { optionnel: false },
        [DOCUMENTS_TYPES_IDS.justificatifDePaiement]: { optionnel: false },
        [DOCUMENTS_TYPES_IDS.documentsCartographiques]: { optionnel: false },
      },
    },
  },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE]: {
    [DEMARCHES_TYPES_IDS.MutationPartielle]: { [ETAPES_TYPES.decisionDeLadministration]: { [DOCUMENTS_TYPES_IDS.arrete]: { optionnel: true } } },
  },
  [TITRES_TYPES_IDS.CONCESSION_METAUX]: { [DEMARCHES_TYPES_IDS.Renonciation]: { [ETAPES_TYPES.decisionImplicite]: { [DOCUMENTS_TYPES_IDS.courrier]: { optionnel: true } } } },
  [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: {
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.decisionDuProprietaireDuSol]: { [DOCUMENTS_TYPES_IDS.lettre]: { optionnel: false, description: "Avis suite à la demande d'accord du propriétaire du sol" } },
      [ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_]: { [DOCUMENTS_TYPES_IDS.arretePrefectoral]: { optionnel: false } },
      [ETAPES_TYPES.demande]: {
        [DOCUMENTS_TYPES_IDS.documentsCartographiques]: { optionnel: false, description: 'Plan à l’échelle 1/50 000ème ou 1/100 000ème' },
        [DOCUMENTS_TYPES_IDS.identificationDeMateriel]: {
          optionnel: false,
          description:
            'la liste et la valeur du matériel d’extraction et de\n traitement que le demandeur détient ou qu’il \nenvisage d’acquérir ainsi que, dans ce dernier\n cas, le financement correspondant. Ces pièces \nsont demandées au titre de la justification des \ncapacités financières du\ndemandeur \n(décret 2001-204, art. 7)',
        },
        [DOCUMENTS_TYPES_IDS.justificationDExistenceDuGisement]: { optionnel: true },
        [DOCUMENTS_TYPES_IDS.lettre]: { optionnel: true },
        [DOCUMENTS_TYPES_IDS.mesuresPrevuesPourRehabiliterLeSite]: {
          optionnel: false,
          description:
            'la définition des mesures prévues par le pétitionnaire pour réhabiliter le site après exploitation, notamment la nature et les modalités de revégétalisation envisagée. (décret 2001-204, art. 5 bis)',
        },
        [DOCUMENTS_TYPES_IDS.methodesPourLExecutionDesTravaux]: { optionnel: false, description: 'descriptif des méthodes envisagées pour l’exécution des travaux ((décret 2001-204, art. 6)' },
        [DOCUMENTS_TYPES_IDS.noticeDImpact]: { optionnel: true },
        [DOCUMENTS_TYPES_IDS.noticeDImpactRenforcee]: { optionnel: true, description: 'Obligatoire pour les AEX hors de la zone 2 du SDOM' },
        [DOCUMENTS_TYPES_IDS.programmeDesTravaux]: { optionnel: false, description: 'Description du phasage et planigramme des travaux. (décret 2001-204, art. 5)' },
        [DOCUMENTS_TYPES_IDS.schemaDePenetrationDuMassifForestier]: {
          optionnel: false,
          description: "le schéma de pénétration du massif forestier proposé par le pétitionnaire pour l'acheminement du matériel lourd et la desserte du chantier (décret 2001-204, art. 5 bis)",
        },
        [DOCUMENTS_TYPES_IDS.lettreDeDemande]: { optionnel: false },
      },
    },
  },
} as const satisfies {
  [titreKey in TitreTypeId]?: {
    [demarcheKey in keyof TDEType[titreKey]]?: {
      [key in Extract<TDEType[titreKey][demarcheKey], readonly EtapeTypeId[]>[number]]?: { [key in DocumentTypeId]?: { optionnel: boolean; description?: string } }
    }
  }
}

type TDEDocumentsTypesUnleashed = { [key in TitreTypeId]?: { [key in DemarcheTypeId]?: { [key in EtapeTypeId]?: { [key in DocumentTypeId]: { optionnel: boolean; description?: string } } } } }

export const toDocuments = (): { etapeTypeId: EtapeTypeId; documentTypeId: DocumentTypeId; optionnel: boolean; description: string | null }[] => {
  return Object.entries(EtapesTypesDocumentsTypes).flatMap(([key, values]) => {
    if (isEtapeTypeId(key)) {
      return values.map(value => ({ etapeTypeId: key, documentTypeId: value.documentTypeId, description: null, optionnel: value.optionnel }))
    } else {
      return []
    }
  })
}

export const getDocuments = (titreTypeId?: TitreTypeId, demarcheId?: DemarcheTypeId, etapeTypeId?: EtapeTypeId): DocumentType[] => {
  if (isNotNullNorUndefined(titreTypeId) && isNotNullNorUndefined(demarcheId) && isNotNullNorUndefined(etapeTypeId)) {
    const documentTypes: DocumentType[] = []

    if (isEtapesTypesEtapesTypesDocumentsTypes(etapeTypeId)) {
      documentTypes.push(...EtapesTypesDocumentsTypes[etapeTypeId].map(({ documentTypeId, optionnel }) => ({ ...DocumentsTypes[documentTypeId], optionnel })))
    }

    Object.keys((TDEDocumentsTypes as TDEDocumentsTypesUnleashed)[titreTypeId]?.[demarcheId]?.[etapeTypeId] ?? {})
      .filter(isDocumentTypeId)
      .forEach(documentTypeIdSpecifique => {
        const documentSpecifique = (TDEDocumentsTypes as TDEDocumentsTypesUnleashed)[titreTypeId]?.[demarcheId]?.[etapeTypeId]?.[documentTypeIdSpecifique]

        if (isNotNullNorUndefined(documentSpecifique)) {
          const knownDocumentType = documentTypes.find(({ id }) => id === documentTypeIdSpecifique)

          if (isNotNullNorUndefined(knownDocumentType)) {
            knownDocumentType.optionnel = documentSpecifique.optionnel
            knownDocumentType.description = documentSpecifique.description ?? knownDocumentType.description
          } else {
            const staticDocumentType = DocumentsTypes[documentTypeIdSpecifique]

            documentTypes.push({ ...staticDocumentType, optionnel: documentSpecifique.optionnel, description: documentSpecifique.description ?? staticDocumentType.description })
          }
        }
      })

    return documentTypes
  } else {
    throw new Error(`il manque des éléments pour trouver les documents titreTypeId: '${titreTypeId}', demarcheId: ${demarcheId}, etapeTypeId: ${etapeTypeId}`)
  }
}
