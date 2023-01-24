import { AdministrationId, ADMINISTRATION_IDS } from './administrations.js'
import { EtapeTypeId, ETAPES_TYPES } from './etapesTypes.js'
import { TitreTypeId } from './titresTypes.js'

// FIXME better representation --> Map Vs array ?
export const restrictions = (
  administrationId: AdministrationId,
  titreTypeId: TitreTypeId,
  etapeTypeId: EtapeTypeId
): {
  lectureInterdit: boolean
  creationInterdit: boolean
  modificationInterdit: boolean
} => {
  const restriction = AdministrationsTitresTypesTitresStatuts.find(entry => {
    return entry.administrationId === administrationId && entry.titreTypeId === titreTypeId && entry.etapeTypeId === etapeTypeId
  })

  if (restriction !== undefined) {
    return restriction
  }

  return { lectureInterdit: false, creationInterdit: false, modificationInterdit: false }
}
const AdministrationsTitresTypesTitresStatuts: {
  administrationId: AdministrationId
  titreTypeId: TitreTypeId
  etapeTypeId: EtapeTypeId
  lectureInterdit: boolean
  creationInterdit: boolean
  modificationInterdit: boolean
}[] = [
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avenantALautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDREALOuDGTMServiceEau,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDREALOuDGTMServiceBiodiversite,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_SaisineDeLaCARM_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.priseEnChargeParLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AjournementDeLaCARM_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_ClassementSansSuite_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisDefavorable_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossierComplementaires,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet__,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_CompletudeDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_SaisineDeLaCARM_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_RecevabiliteDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avenantALautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_CompletudeDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_SaisineDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.priseEnChargeParLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  { administrationId: ADMINISTRATION_IDS['MRAE GUYANE'], titreTypeId: 'arm', etapeTypeId: ETAPES_TYPES.demande, lectureInterdit: false, creationInterdit: true, modificationInterdit: true },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_RecevabiliteDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AjournementDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_ClassementSansSuite_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisDefavorable_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossierComplementaires,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet__,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_CompletudeDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_SaisineDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_RecevabiliteDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['MRAE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avenantALautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.priseEnChargeParLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  { administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'], titreTypeId: 'arm', etapeTypeId: ETAPES_TYPES.demande, lectureInterdit: false, creationInterdit: true, modificationInterdit: true },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AjournementDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_ClassementSansSuite_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisDefavorable_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossierComplementaires,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  { administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'], titreTypeId: 'cxm', etapeTypeId: ETAPES_TYPES.demande, lectureInterdit: false, creationInterdit: true, modificationInterdit: true },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeLavisDeDecisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionAdministrative,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.initiationDeLaDemarcheDeRetrait,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  { administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'], titreTypeId: 'prm', etapeTypeId: ETAPES_TYPES.demande, lectureInterdit: false, creationInterdit: true, modificationInterdit: true },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  { administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'], titreTypeId: 'pxm', etapeTypeId: ETAPES_TYPES.demande, lectureInterdit: false, creationInterdit: true, modificationInterdit: true },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeLavisDeDecisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionAdministrative,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.initiationDeLaDemarcheDeRetrait,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeLavisDeDecisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionAdministrative,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.initiationDeLaDemarcheDeRetrait,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - BOURGOGNE-FRANCHE-COMTÉ - SIÈGE DE BESANÇON'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeLavisDeDecisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionAdministrative,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.initiationDeLaDemarcheDeRetrait,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - GRAND EST - SIÈGE DE METZ'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilDEtat,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeLavisDeDecisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionAdministrative,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.initiationDeLaDemarcheDeRetrait,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['DREAL - OCCITANIE - SIÈGE DE TOULOUSE'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avenantALautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDREALOuDGTMServiceEau,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_CompletudeDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_SaisineDeLaCARM_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.priseEnChargeParLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_RecevabiliteDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AjournementDeLaCARM_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_ClassementSansSuite_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisDefavorable_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossierComplementaires,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet__,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_CompletudeDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_SaisineDeLaCARM_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_RecevabiliteDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeDirectionRegionaleDesAffairesCulturelles,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaDirectionRegionaleDesFinancesPubliques,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaGendarmerieNationale,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDunMaire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLetatMajorOrpaillageEtPecheIllicite_EMOPI_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLagenceRegionaleDeSante,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.decisionDuProprietaireDuSol,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCaisseGeneraleDeSecuriteSociale,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.confirmationDeLaccordDuProprietaireDuSol,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.expertiseDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.informationsHistoriquesIncompletes,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_RecevabiliteDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_AvisDuDREALDEALOuDGTM_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.notificationDesCollectivitesLocales,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.noteInterneSignalee,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.publicationDansUnJournalLocalOuNational,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_RecevabiliteDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_AvisDuDREALDEALOuDGTM_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.saisineDesCollectivitesLocales,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.saisineDesServices,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuneCollectiviteLocale,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDunPresidentDEPCI,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeLIfremer,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDunMaire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuParcNaturelMarin,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeLInstitutNationalDeLorigineEtDeLaQualite,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilDEtat,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDunServiceAdministratifLocal,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeLautoriteMilitaire,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuParcNational,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuPrefet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.clotureDeLenquetePublique,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLenquetePublique,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.informationsHistoriquesIncompletes,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.notificationDesCollectivitesLocales,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.noteInterneSignalee,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.avisDuParcNaturelRegional,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.publicationDansUnJournalLocalOuNational,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilDEtat,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDesCollectivitesLocales,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilDEtat,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'cxm',
    etapeTypeId: ETAPES_TYPES.saisineDesServices,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDuneCollectiviteLocale,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDunPresidentDEPCI,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDunMaire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLInstitutNationalDeLorigineEtDeLaQualite,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDunServiceAdministratifLocal,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLautoriteMilitaire,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDuParcNational,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDuPrefet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.informationsHistoriquesIncompletes,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.notificationDesCollectivitesLocales,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.noteInterneSignalee,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDuParcNaturelRegional,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.clotureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLaParticipationDuPublic,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDansUnJournalLocalOuNational,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDesCollectivitesLocales,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.saisineDesServices,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDuneCollectiviteLocale,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDunMaire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDunServiceAdministratifLocal,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDeLautoriteMilitaire,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDuParcNational,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDuPrefet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.publicationDeLavisDeDecisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.clotureDeLenquetePublique,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.ouvertureDeLenquetePublique,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.informationsHistoriquesIncompletes,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDeDemandeConcurrente,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.notificationDesCollectivitesLocales,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.noteInterneSignalee,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.notificationAuPrefet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.avisDuParcNaturelRegional,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.publicationDansUnJournalLocalOuNational,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.rapportDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.saisineDuConseilGeneralDeLeconomie_CGE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.saisineDesCollectivitesLocales,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.saisineDuPrefet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['BRGM - PROJET ZERCOA'],
    titreTypeId: 'pxm',
    etapeTypeId: ETAPES_TYPES.saisineDesServices,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDREALOuDGTMServiceEau,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_RecevabiliteDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.noteInterneSignalee,
    lectureInterdit: true,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_RecevabiliteDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeDirectionRegionaleDesAffairesCulturelles,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.abrogationDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaDirectionRegionaleDesFinancesPubliques,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaGendarmerieNationale,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDunMaire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.decisionDuJugeAdministratif,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLetatMajorOrpaillageEtPecheIllicite_EMOPI_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLagenceRegionaleDeSante,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.decisionDuProprietaireDuSol,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCaisseGeneraleDeSecuriteSociale,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.confirmationDeLaccordDuProprietaireDuSol,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.decisionDeLadministration,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.decisionImplicite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.expertiseDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.informationsHistoriquesIncompletes,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_RecevabiliteDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_AvisDuDREALDEALOuDGTM_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.notificationDesCollectivitesLocales,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.noteInterneSignalee,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.publicationDansUnJournalLocalOuNational,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_RecevabiliteDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_AvisDuDREALDEALOuDGTM_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.retraitDeLaDecision,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.saisineDeLautoriteSignataire,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.saisineDesCollectivitesLocales,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDepartementaleDesMines_CDM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'axm',
    etapeTypeId: ETAPES_TYPES.saisineDesServices,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    titreTypeId: 'prm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avenantALautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDREALOuDGTMServiceEau,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.priseEnChargeParLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_RecevabiliteDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AjournementDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_ClassementSansSuite_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisDefavorable_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: false,
    modificationInterdit: false
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossierComplementaires,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_RecevabiliteDeLaDemande_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avenantALautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.avisDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.classementSansSuite,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.expertiseDeLOfficeNationalDesForets,
    lectureInterdit: true,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_CompletudeDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDeComplements_SaisineDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.depotDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.priseEnChargeParLOfficeNationalDesForets,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_RecevabiliteDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.demandeDinformations_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AjournementDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_ClassementSansSuite_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisDefavorable_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossierComplementaires,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet__,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_CompletudeDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDeComplements_SaisineDeLaCARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_AvisDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_RecevabiliteDeLaDemande_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.receptionDinformation_ExpertiseDeLOfficeNationalDesForets_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  },
  {
    administrationId: ADMINISTRATION_IDS['PRÉFECTURE - GUYANE'],
    titreTypeId: 'arm',
    etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier,
    lectureInterdit: false,
    creationInterdit: true,
    modificationInterdit: true
  }
]
