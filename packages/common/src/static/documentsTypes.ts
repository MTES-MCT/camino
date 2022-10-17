export interface DocumentType {
  id: string
  nom: string
  optionnel: boolean
  description?: string
}

interface Definition<T> {
  id: T
  nom: string
  description?: string
}

export const DOCUMENTS_TYPES_IDS = {
  avisDUnServiceDeLAdministrationCentrale: 'aac',
  accordDuProprietaireDuSolOuDuGestionnaire: 'acc',
  avisDeLaCommissionDepartementaleDesMines: 'acd',
  avisDuConseilGeneralDeLEconomie_cge: 'acg',
  avisDesServicesCivilsEtMilitaires: 'acm',
  accuseDeReceptionDUneDemande: 'acr',
  avisDuDirecteurRegionalChargeDesMines: 'adr',
  avisDEnquetePublique: 'aep',
  arreteAutorisantLOuvertureDeTravauxMiniers: 'aot',
  arreteDeSecondDonneActe_ap2: 'apd',
  avisDuPrefet: 'apf',
  arreteDePoliceDesMines: 'apm',
  arreteDePremierDonneActe_ap1: 'apu',
  arreteDeRefus: 'are',
  arreteMinisteriel: 'arm',
  arretePrefectoral: 'arp',
  arrete: 'arr',
  attestationFiscale: 'atf',
  avisDeMiseEnConcurrence: 'avc',
  avenant: 'ave',
  avis: 'avi',
  TroisDerniersBilansEtComptesDeResultats: 'bil',
  contratDAmodiation: 'cam',
  documentsCartographiques: 'car',
  courrierDeDemandeDeComplements: 'cco',
  cahierDesCharges: 'cdc',
  courrierDeNotificationDeLaRecevabilite: 'cnr',
  contrat: 'cnt',
  complementsAuDossierDeDemande: 'cod',
  convention: 'con',
  courrier: 'cou',
  courrierDeSaisineDuPrefet: 'csp',
  curriculumVitae: 'cur',
  declaration: 'dcl',
  declarationsBancairesOuCautionsAppropriees: 'deb',
  decret: 'dec',
  decision: 'dei',
  decisionCasParCas: 'dep',
  dossierLoiSurLEau: 'doe',
  dossierDeDemande: 'dom',
  dossier: 'dos',
  extraitDuRegistreDesDeliberationsDeLaSectionDesTravauxPublicDuConseilDEtat: 'erd',
  facture: 'fac',
  ficheDeCompletude: 'fic',
  ficheDePresentation: 'fip',
  formulaireDeDemande: 'for',
  identificationDeMateriel: 'idm',
  justificatifDAdhesionALaCharteDesBonnesPratiques: 'jac',
  justificatifDesCapacitesFinancieres: 'jcf',
  justificatifDesCapacitesTechniques: 'jct',
  justificationDExistenceDuGisement: 'jeg',
  justificatifDIdentite: 'jid',
  justificatifDePaiement: 'jpa',
  kbis: 'kbi',
  lettreDeSaisineDesServicesDeLAdministrationCentrale: 'lac',
  lettreDeSaisineDuConseilDEtat: 'lce',
  lettreDeSaisineDuConseilGeneralDeLEconomie_cge: 'lcg',
  lettreDeSaisineDesServicesCivilsEtMilitaires: 'lcm',
  lettreDeDemande: 'lem',
  lettre: 'let',
  listeDesTravauxAnterieurs: 'lis',
  lettreDeSaisineDuPrefet: 'lpf',
  mesuresPrevuesPourRehabiliterLeSite: 'mes',
  methodesPourLExecutionDesTravaux: 'met',
  motif: 'mot',
  noteALAutoriteSignataire: 'nas',
  notificationDeDemandeConcurrente: 'ndc',
  notificationDeDecision: 'ndd',
  noticeDImpact: 'nip',
  noticeDImpactRenforcee: 'nir',
  noteInterneSignalee: 'nis',
  noticeDIncidence: 'noi',
  notes: 'not',
  ordreDuJourDeLaCommissionDepartementaleDesMines: 'ocd',
  ordonnanceDuRoi: 'odr',
  ordonnance: 'ord',
  plan: 'pla',
  programmeDesTravaux: 'prg',
  projetDePrescriptions: 'pro',
  publicationAuJorf: 'pub',
  pvDeRecolement: 'pvr',
  rapportDeLAdministrationCentraleChargeDesMines: 'rac',
  rapportDreal: 'rad',
  rapport: 'rap',
  rapportDuCommissaireEnqueteur: 'rce',
  rapportDeRecevabilite: 'rcr',
  rapportDeLaDirectionRegionaleChargeeDesMines: 'rdr',
  recepisseDeDeclarationDOuvertureDesTravauxMiniers: 'rdt',
  recepisse_LoiSurLEau: 'rec',
  rapportEnvironnementalDExploration: 'ree',
  referencesProfessionnelles: 'ref',
  rapportFinancierDExploration: 'rfe',
  rapportAnnuelDExploitation: 'rgr',
  rapportDIntensiteDExploration: 'rie',
  rapportSocialEtEconomiqueDExploration: 'rse',
  schemaDePenetrationDuMassifForestier: 'sch',
  avisDeSituationAuRepertoireSirene: 'sir'
} as const

export type DocumentTypeId = typeof DOCUMENTS_TYPES_IDS[keyof typeof DOCUMENTS_TYPES_IDS]

export const DocumentsTypes: { [key in DocumentTypeId]: Definition<key> } = {
  aac: {
    id: 'aac',
    nom: "Avis d'un service de l'administration centrale"
  },
  acc: {
    id: 'acc',
    nom: 'Accord du propriétaire du sol ou du gestionnaire'
  },
  acd: {
    id: 'acd',
    nom: 'Avis de la commission départementale des mines'
  },
  acg: {
    id: 'acg',
    nom: "Avis du conseil général de l'économie (CGE)"
  },
  acm: {
    id: 'acm',
    nom: 'Avis des services civils et militaires'
  },
  acr: {
    id: 'acr',
    nom: "Accusé de réception d'une demande"
  },
  adr: {
    id: 'adr',
    nom: 'Avis du directeur régional chargé des mines'
  },
  aep: {
    id: 'aep',
    nom: "Avis d'enquête publique"
  },
  aot: {
    id: 'aot',
    nom: "Arrêté autorisant l'ouverture de travaux miniers"
  },
  apd: {
    id: 'apd',
    nom: 'Arrêté de second donné acte (AP2)'
  },
  apf: {
    id: 'apf',
    nom: 'Avis du préfet'
  },
  apm: {
    id: 'apm',
    nom: 'Arrêté de police des mines'
  },
  apu: {
    id: 'apu',
    nom: 'Arrêté de premier donné acte (AP1)'
  },
  are: {
    id: 'are',
    nom: 'Arrêté de refus '
  },
  arm: {
    id: 'arm',
    nom: 'Arrêté ministériel'
  },
  arp: {
    id: 'arp',
    nom: 'Arrêté préfectoral'
  },
  arr: {
    id: 'arr',
    nom: 'Arrêté'
  },
  atf: {
    id: 'atf',
    nom: 'Attestation fiscale'
  },
  avc: {
    id: 'avc',
    nom: 'Avis de mise en concurrence'
  },
  ave: {
    id: 'ave',
    nom: 'Avenant'
  },
  avi: {
    id: 'avi',
    nom: 'Avis'
  },
  bil: {
    id: 'bil',
    nom: '3 derniers bilans et comptes de résultats'
  },
  cam: {
    id: 'cam',
    nom: "Contrat d'amodiation"
  },
  car: {
    id: 'car',
    nom: 'Documents cartographiques'
  },
  cco: {
    id: 'cco',
    nom: 'Courrier de demande de compléments'
  },
  cdc: {
    id: 'cdc',
    nom: 'Cahier des charges'
  },
  cnr: {
    id: 'cnr',
    nom: 'Courrier de notification de la recevabilité'
  },
  cnt: {
    id: 'cnt',
    nom: 'Contrat'
  },
  cod: {
    id: 'cod',
    nom: 'Compléments au dossier de demande'
  },
  con: {
    id: 'con',
    nom: 'Convention'
  },
  cou: {
    id: 'cou',
    nom: 'Courrier'
  },
  csp: {
    id: 'csp',
    nom: 'Courrier de saisine du préfet '
  },
  cur: {
    id: 'cur',
    nom: 'Curriculum vitae'
  },
  dcl: {
    id: 'dcl',
    nom: 'Déclaration'
  },
  deb: {
    id: 'deb',
    nom: 'Déclarations bancaires ou cautions appropriées'
  },
  dec: {
    id: 'dec',
    nom: 'Décret'
  },
  dei: {
    id: 'dei',
    nom: 'Décision'
  },
  dep: {
    id: 'dep',
    nom: 'Décision cas par cas'
  },
  doe: {
    id: 'doe',
    nom: 'Dossier "Loi sur l\'eau"'
  },
  dom: {
    id: 'dom',
    nom: 'Dossier de demande'
  },
  dos: {
    id: 'dos',
    nom: 'Dossier'
  },
  erd: {
    id: 'erd',
    nom: "Extrait du registre des délibérations de la section des travaux public du Conseil d'Etat"
  },
  fac: {
    id: 'fac',
    nom: 'Facture'
  },
  fic: {
    id: 'fic',
    nom: 'Fiche de complétude'
  },
  fip: {
    id: 'fip',
    nom: 'Fiche de présentation'
  },
  for: {
    id: 'for',
    nom: 'Formulaire de demande'
  },
  idm: {
    id: 'idm',
    nom: 'Identification de matériel'
  },
  jac: {
    id: 'jac',
    nom: 'Justificatif d’adhésion à la charte des bonnes pratiques'
  },
  jcf: {
    id: 'jcf',
    nom: 'Justificatif des capacités financières'
  },
  jct: {
    id: 'jct',
    nom: 'Justificatif des capacités techniques'
  },
  jeg: {
    id: 'jeg',
    nom: 'Justification d’existence du gisement'
  },
  jid: {
    id: 'jid',
    nom: "Justificatif d'identité"
  },
  jpa: {
    id: 'jpa',
    nom: 'Justificatif de paiement'
  },
  kbi: {
    id: 'kbi',
    nom: 'Kbis'
  },
  lac: {
    id: 'lac',
    nom: "Lettre de saisine des services de l'administration centrale"
  },
  lce: {
    id: 'lce',
    nom: "Lettre de saisine du conseil d'Etat"
  },
  lcg: {
    id: 'lcg',
    nom: "Lettre de saisine du conseil général de l'économie (CGE)"
  },
  lcm: {
    id: 'lcm',
    nom: 'Lettre de saisine des services civils et militaires'
  },
  lem: {
    id: 'lem',
    nom: 'Lettre de demande'
  },
  let: {
    id: 'let',
    nom: 'Lettre'
  },
  lis: {
    id: 'lis',
    nom: 'Liste des travaux antérieurs',
    description: 'Liste des travaux auxquels le demandeur a participé au cours des 3 dernières années'
  },
  lpf: {
    id: 'lpf',
    nom: 'Lettre de saisine du préfet'
  },
  mes: {
    id: 'mes',
    nom: 'Mesures prévues pour réhabiliter le site '
  },
  met: {
    id: 'met',
    nom: "Méthodes pour l'exécution des travaux"
  },
  mot: {
    id: 'mot',
    nom: 'Motif'
  },
  nas: {
    id: 'nas',
    nom: "Note à l'autorité signataire"
  },
  ndc: {
    id: 'ndc',
    nom: 'Notification de demande concurrente'
  },
  ndd: {
    id: 'ndd',
    nom: 'Notification de décision'
  },
  nip: {
    id: 'nip',
    nom: 'Notice d’impact'
  },
  nir: {
    id: 'nir',
    nom: 'Notice d’impact renforcée'
  },
  nis: {
    id: 'nis',
    nom: 'Note interne signalée'
  },
  noi: {
    id: 'noi',
    nom: "Notice d'incidence"
  },
  not: {
    id: 'not',
    nom: 'Notes'
  },
  ocd: {
    id: 'ocd',
    nom: 'Ordre du jour de la commission départementale des mines'
  },
  odr: {
    id: 'odr',
    nom: 'Ordonnance du Roi'
  },
  ord: {
    id: 'ord',
    nom: 'Ordonnance'
  },
  pla: {
    id: 'pla',
    nom: 'Plan'
  },
  prg: {
    id: 'prg',
    nom: 'Programme des travaux '
  },
  pro: {
    id: 'pro',
    nom: 'Projet de prescriptions'
  },
  pub: {
    id: 'pub',
    nom: 'Publication au JORF'
  },
  pvr: {
    id: 'pvr',
    nom: 'PV de récolement'
  },
  rac: {
    id: 'rac',
    nom: 'Rapport de l’administration centrale chargé des mines'
  },
  rad: {
    id: 'rad',
    nom: 'Rapport DREAL'
  },
  rap: {
    id: 'rap',
    nom: 'Rapport'
  },
  rce: {
    id: 'rce',
    nom: 'Rapport du commissaire enquêteur'
  },
  rcr: {
    id: 'rcr',
    nom: 'Rapport de recevabilité'
  },
  rdr: {
    id: 'rdr',
    nom: 'Rapport de la direction régionale chargée des mines'
  },
  rdt: {
    id: 'rdt',
    nom: "Récépissé de déclaration d'ouverture des travaux miniers"
  },
  rec: {
    id: 'rec',
    nom: 'Récépissé "Loi sur l\'eau"'
  },
  ree: {
    id: 'ree',
    nom: "Rapport environnemental d'exploration"
  },
  ref: {
    id: 'ref',
    nom: 'Références professionnelles ',
    description: 'Références professionnelles du demandeur ou celles des cadres chargés du suivi et de la conduite des travaux'
  },
  rfe: {
    id: 'rfe',
    nom: "Rapport financier d'exploration"
  },
  rgr: {
    id: 'rgr',
    nom: "rapport annuel d'exploitation"
  },
  rie: {
    id: 'rie',
    nom: 'Rapport d’intensité d’exploration'
  },
  rse: {
    id: 'rse',
    nom: "Rapport social et économique d'exploration"
  },
  sch: {
    id: 'sch',
    nom: 'Schéma de pénétration du massif forestier'
  },
  sir: {
    id: 'sir',
    nom: 'Avis de situation au répertoire Sirene'
  }
}

const documentsTypesIds = Object.values(DOCUMENTS_TYPES_IDS)

export const isDocumentTypeId = (documentTypeId: string | null | undefined): documentTypeId is DocumentTypeId => documentsTypesIds.includes(documentTypeId)
