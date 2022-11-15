import { Definition } from '../definition'

export const ETAPES_TYPES = {
  avisDeDirectionRegionaleDesAffairesCulturelles: 'aac',
  avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet: 'aaf',
  abrogationDeLaDecision: 'abd',
  avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_: 'abs',
  avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_: 'aca',
  avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst_: 'acd',
  avisDuConseilGeneralDeLeconomie_CGE_: 'acg',
  avisDuneCollectiviteLocale: 'acl',
  avenantALautorisationDeRechercheMiniere: 'aco',
  avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi: 'aec',
  avisDunPresidentDEPCI: 'aep',
  avisDeLaDirectionRegionaleDesFinancesPubliques: 'afp',
  avisDeLaGendarmerieNationale: 'agn',
  avisDeLIfremer: 'aim',
  avisDunMaire: 'ama',
  avisDuParcNaturelMarin: 'ami',
  decisionDuJugeAdministratif: 'and',
  avisDeMiseEnConcurrenceAuJOUE: 'ane',
  avisDeMiseEnConcurrenceAuJORF: 'anf',
  avisDeLOfficeNationalDesForets: 'aof',
  avisDeLInstitutNationalDeLorigineEtDeLaQualite: 'aop',
  avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement: 'apd',
  avisDuConseilDEtat: 'ape',
  avisDeLetatMajorOrpaillageEtPecheIllicite_EMOPI_: 'api',
  avisDunServiceAdministratifLocal: 'apl',
  avisDeLautoriteMilitaire: 'apm',
  avisDuParcNational: 'apn',
  avisDeLaCommissionDepartementaleDesMines_CDM_: 'apo',
  avisDuPrefet: 'app',
  publicationDeLavisDeDecisionImplicite: 'apu',
  avisDuPrefetMaritime: 'apw',
  avisDeLaReunionInterservice: 'ari',
  avisDeLagenceRegionaleDeSante: 'ars',
  decisionDuProprietaireDuSol: 'asl',
  avisDeLaCaisseGeneraleDeSecuriteSociale: 'ass',
  avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_: 'auc',
  consultationDesAdministrationsCentrales: 'cac',
  concertationInterministerielle: 'cim',
  saisineDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst_: 'cod',
  confirmationDeLaccordDuProprietaireDuSol: 'cps',
  classementSansSuite: 'css',
  decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: 'dae',
  declaration: 'dec',
  decisionDeLOfficeNationalDesForets: 'def',
  desistementDuDemandeur: 'des',
  decisionDeLadministration: 'dex',
  decisionImplicite: 'dim',
  publicationDeDecisionAuJORF: 'dpu',
  publicationDeDecisionAdministrativeAuJORF: 'dup',
  decisionAdministrative: 'dux',
  decisionAdministrative_duy: 'duy',
  expertiseDREALOuDGTMServiceEau: 'ede',
  expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_: 'edm',
  expertiseDeLOfficeNationalDesForets: 'eof',
  clotureDeLenquetePublique: 'epc',
  ouvertureDeLenquetePublique: 'epu',
  expertiseDREALOuDGTMServiceBiodiversite: 'esb',
  initiationDeLaDemarcheDeRetrait: 'ide',
  informationsHistoriquesIncompletes: 'ihi',
  demandeDeComplements_RecevabiliteDeLaDemande_: 'mca',
  demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_: 'mcb',
  demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: 'mcd',
  demandeDeComplements_CompletudeDeLaDemande_: 'mcm',
  demandeDeComplements: 'mco',
  completudeDeLaDemande: 'mcp',
  recevabiliteDeLaDemande: 'mcr',
  demandeDeComplements_SaisineDeLaCARM_: 'mcs',
  depotDeLaDemande: 'mdp',
  avisDeDemandeConcurrente: 'mec',
  enregistrementDeLaDemande: 'men',
  priseEnChargeParLOfficeNationalDesForets: 'meo',
  demande: 'mfr',
  demandeDinformations_AvisDeLOfficeNationalDesForets_: 'mia',
  demandeDinformations_AvisDuDREALDEALOuDGTM_: 'mie',
  demandeDinformations: 'mif',
  demandeDinformations_RecevabiliteDeLaDemande_: 'mim',
  demandeDinformations_ExpertiseDeLOfficeNationalDesForets_: 'mio',
  notificationAuDemandeur_AjournementDeLaCARM_: 'mna',
  notificationAuDemandeur_AvisFavorableDeLaCARM_: 'mnb',
  notificationAuDemandeur_ClassementSansSuite_: 'mnc',
  notificationAuDemandeur_AvisDefavorable_: 'mnd',
  notificationAuDemandeur_InitiationDeLaDemarcheDeRetrait_: 'mni',
  notificationAuDemandeur: 'mno',
  notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_: 'mns',
  notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_: 'mnv',
  modificationDeLaDemande: 'mod',
  modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_: 'mom',
  notificationDesCollectivitesLocales: 'ncl',
  noteInterneSignalee: 'nis',
  notificationAuPrefet: 'npp',
  paiementDesFraisDeDossierComplementaires: 'pfc',
  paiementDesFraisDeDossier: 'pfd',
  avisDuParcNaturelRegional: 'pnr',
  clotureDeLaParticipationDuPublic: 'ppc',
  ouvertureDeLaParticipationDuPublic: 'ppu',
  publicationDansUnJournalLocalOuNational: 'pqr',
  receptionDeComplements_RecevabiliteDeLaDemande_: 'rca',
  receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_: 'rcb',
  receptionDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet__: 'rcd',
  rapportDuConseilGeneralDeLeconomie_CGE_: 'rcg',
  receptionDeComplements_CompletudeDeLaDemande_: 'rcm',
  receptionDeComplements: 'rco',
  receptionDeComplements_SaisineDeLaCARM_: 'rcs',
  recepisseDeDeclarationLoiSurLeau: 'rde',
  receptionDinformation_AvisDeLOfficeNationalDesForets_: 'ria',
  receptionDinformation_AvisDuDREALDEALOuDGTM_: 'rie',
  receptionDinformation: 'rif',
  receptionDinformation_RecevabiliteDeLaDemande_: 'rim',
  receptionDinformation_ExpertiseDeLOfficeNationalDesForets_: 'rio',
  rapportDuConseilDEtat: 'rpe',
  publicationDeDecisionAuRecueilDesActesAdministratifs: 'rpu',
  retraitDeLaDecision: 'rtd',
  saisineDeLautoriteSignataire: 'sas',
  saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_: 'sca',
  saisineDuConseilGeneralDeLeconomie_CGE_: 'scg',
  saisineDesCollectivitesLocales: 'scl',
  signatureDeLautorisationDeRechercheMiniere: 'sco',
  saisineDuConseilDEtat: 'spe',
  saisineDeLaCommissionDepartementaleDesMines_CDM_: 'spo',
  saisineDuPrefet: 'spp',
  saisineDesServices: 'ssr',
  validationDuPaiementDesFraisDeDossierComplementaires: 'vfc',
  validationDuPaiementDesFraisDeDossier: 'vfd',
  abandonDeLaDemande: 'wab',
  avisDeDirectionRegionaleDesAffairesCulturellesDRAC: 'wac',
  avisDeLaDirectionDepartementaleDesTerritoiresEtDeLaMerDDT_M_: 'wad',
  avisDeLautoriteEnvironnementale: 'wae',
  avisDesAutresInstances: 'wai',
  avisDunServiceAdministratifLocal_wal: 'wal',
  avisDeLautoriteMilitaire_wam: 'wam',
  arreteDouvertureDesTravauxMiniers: 'wao',
  avisDuPrefetMaritime_wap: 'wap',
  avisDeReception: 'war',
  avisDeLagenceRegionaleDeSanteARS: 'was',
  avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst__wat: 'wat',
  avisDuDemandeurSurLesPrescriptionsProposees: 'wau',
  clotureDeLenquetePublique_wce: 'wce',
  receptionDeComplements_wco: 'wco',
  donneActeDeLaDeclaration_DOTM_: 'wda',
  demandeDeComplements_AOTMOuDOTM_: 'wdc',
  depotDeLaDemande_wdd: 'wdd',
  demandeDeComplements_DADT_: 'wde',
  decisionDeLadministration_wdm: 'wdm',
  avisDeLaDDT_M_: 'wdt',
  demandeDautorisationDouvertureDeTravauxMiniers_AOTM_: 'wfa',
  declarationDarretDefinitifDeTravaux_DADT_: 'wfd',
  declarationDouvertureDeTravauxMiniers_DOTM_: 'wfo',
  demandeDautorisationDouvertureDeTravauxMiniers_DAOTM_: 'wfr',
  memoireEnReponseDeLexploitant_ParRapportALavisDeLAE_: 'wmm',
  memoireEnReponseDeLexploitant: 'wmr',
  memoireDeFinDeTravaux: 'wmt',
  ouvertureDeLenquetePublique_woe: 'woe',
  publicationDeDecisionAuRecueilDesActesAdministratifs_wpa: 'wpa',
  porterAConnaissance: 'wpb',
  arreteDePrescriptionsComplementaires: 'wpc',
  arreteDeSecondDonnerActe: 'wpo',
  arretePrefectoralDePremierDonnerActe_DADT_: 'wpp',
  arretePrefectoralDeSursisAStatuer: 'wps',
  receptionDeComplements_wrc: 'wrc',
  rapportDeLaDreal: 'wrd',
  recevabilite: 'wre',
  avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement_wrl: 'wrl',
  recolement: 'wrt',
  saisineDeLautoriteEnvironnementale: 'wse',
  saisineDesServicesDeLEtat: 'wss',
  transmissionDuProjetDePrescriptionsAuDemandeur: 'wtp'
} as const

export type EtapeTypeId = typeof ETAPES_TYPES[keyof typeof ETAPES_TYPES]
export type EtapeTypeKey = keyof typeof ETAPES_TYPES

const etapesTypesIds = Object.values(ETAPES_TYPES)

export const EtapesTypes: { [key in EtapeTypeId]: Omit<Definition<key>, 'ordre'> } = {
  aac: {
    id: 'aac',
    nom: 'avis de direction régionale des affaires culturelles',
    description: 'Avis sur la situation archéologique du site en question.'
  },
  aaf: {
    id: 'aaf',
    nom: "avis de la direction d'alimentation de l'agriculture et de la forêt",
    description: 'Avis pour un titre minier.'
  },
  abd: {
    id: 'abd',
    nom: 'abrogation de la décision',
    description: 'Suppression de l’acte administratif pour l’avenir.'
  },
  abs: {
    id: 'abs',
    nom: 'avis DGTM service milieux naturels, biodiversité, sites et paysages (MNBST)',
    description: "Avis du MNBST sur la notice d’impact pour les titres miniers et les autorisations d'exploitation."
  },
  aca: {
    id: 'aca',
    nom: 'avis de la commission des autorisations de recherches minières (CARM)',
    description: ''
  },
  acd: {
    id: 'acd',
    nom: "avis du conseil départemental de l'environnement et des risques sanitaires et technologiques (Coderst)",
    description: ''
  },
  acg: {
    id: 'acg',
    nom: "avis du conseil général de l'économie (CGE)",
    description: "Le conseil général de l'économie donne un avis sur la demande et sur son instruction au ministre chargé des mines. Cet avis n'est pas conforme."
  },
  acl: {
    id: 'acl',
    nom: "avis d'une collectivité locale",
    description: "Avis de la collectivité locale dans le cadre de l’instruction d’un titre ou d'une demande relative à la police des mines."
  },
  aco: {
    id: 'aco',
    nom: 'avenant à l’autorisation de recherche minière',
    description: 'Document (courrier) validant une demande de renouvellement et actant la prolongation de la durée de l’autorisation.'
  },
  aec: {
    id: 'aec',
    nom: "avis de la direction des entreprises, de la concurrence, de la consommation, du travail et de l'emploi",
    description: 'Avis facultatif sur la situation économique de l’entreprise.'
  },
  aep: {
    id: 'aep',
    nom: "avis d'un président d'EPCI",
    description: "Avis du président d’EPCI dans le cadre de l’instruction d’un titre ou d'une demande relative à la police des mines."
  },
  afp: {
    id: 'afp',
    nom: 'avis de la direction régionale des finances publiques',
    description: 'Avis délivré sur la régularité fiscale de l’entreprise.'
  },
  agn: {
    id: 'agn',
    nom: 'avis de la gendarmerie nationale',
    description: "Avis sur l'instruction d'un titre minier  ou d'une demande relative à la police des mines "
  },
  aim: {
    id: 'aim',
    nom: "avis de l'Ifremer",
    description: 'Avis de l’institut français de recherche pour l’exploitation en mer (IFREMER) dans le cadre d’autorisation en mer.'
  },
  ama: {
    id: 'ama',
    nom: "avis d'un maire",
    description: "Avis du maire, dans le cadre de l’instruction d’un titre ou d'une demande relative à la police des mines."
  },
  ami: {
    id: 'ami',
    nom: 'avis du parc naturel marin',
    description: 'Avis du parc naturel marin dans le cadre d’autorisation en mer.'
  },
  and: {
    id: 'and',
    nom: 'décision du juge administratif',
    description: 'Décision à un contentieux ou à un référé.'
  },
  ane: {
    id: 'ane',
    nom: 'avis de mise en concurrence au JOUE',
    description:
      "Pour les titres miniers H (hydrocarbures), étape par laquelle le ministre chargé des mines publie l'avis de mise en concurrence au Journal officiel de l'Union européenne au frais du demandeur."
  },
  anf: {
    id: 'anf',
    nom: 'avis de mise en concurrence au JORF',
    description:
      "Pour les titres miniers H (hydrocarbures), étape par laquelle le ministre chargé des mines publie l'avis de mise en concurrence au Journal officiel de la République française au frais du demandeur. Pour les titres miniers M (métaux), étape par laquelle le préfet publie l'avis de mise en concurrence au Journal officiel de la République française au frais du demandeur."
  },
  aof: {
    id: 'aof',
    nom: "avis de l'Office national des forêts",
    description: 'Avis délivré par l’ONF dans le cadre de l’instruction d’un titre minier.\n'
  },
  aop: {
    id: 'aop',
    nom: "avis de l'Institut national de l'origine et de la qualité",
    description: ''
  },
  apd: {
    id: 'apd',
    nom: "Avis et rapport du directeur régional chargé de l'environnement, de l'aménagement et du logement",
    description:
      "Étape par laquelle le DREAL ou le DEAL rend un avis sur la demande. Cet avis tient compte du rapport rédigé par le service instructeur de la DREAL ou de la DEAL qui s'appuie sur les avis émis par les chefs des services civils et de l'autorité militaire intéressés sur la demande."
  },
  ape: {
    id: 'ape',
    nom: "avis du Conseil d'Etat",
    description:
      "Le conseil d’État donne au premier ministre et au ministre chargé des mines un avis sur la demande et sur son instruction. Cet avis n'est pas conforme mais si la décision s'écarte de l'avis donné, elle doit être validée en conseil des ministres."
  },
  api: {
    id: 'api',
    nom: "avis de l'état major orpaillage et pêche illicite (EMOPI)",
    description: 'Avis pour tous les titres miniers en Guyane.'
  },
  apl: {
    id: 'apl',
    nom: "avis d'un service administratif local",
    description: ''
  },
  apm: {
    id: 'apm',
    nom: "avis de l'autorité militaire",
    description: "Avis de l’autorité militaire, délivré dans le cadre de l’instruction d’un titre minier ou d'une demande relative à la police des mines."
  },
  apn: {
    id: 'apn',
    nom: 'avis du parc national',
    description: "Avis du parc national dans le cadre de l’instruction d’un titre ou d'une demande relative à la police des mines."
  },
  apo: {
    id: 'apo',
    nom: 'avis de la commission départementale des mines (CDM)',
    description: 'L’avis de cette commission est consultatif et donne lieu à des votes des différents membres des collèges. Les représentants des administrations participent également.'
  },
  app: {
    id: 'app',
    nom: 'avis du préfet',
    description:
      'Le préfet émet un avis à l’issue de l’instruction du dossier, prenant en compte les avis délivrés par les services déconcentrés et éventuellement, l’avis de la commission des mines en Guyane.'
  },
  apu: {
    id: 'apu',
    nom: "publication de l'avis de décision implicite",
    description:
      'Le principe adopté par la réglementation actuelle veut que le silence de l’administration pendant un délai fixé vaut accord implicite. Toutefois il existe des décisions implicites de rejets pour certaines catégories de décisions. En particulier pour les titres miniers, l’octroi, la prolongation et la mutation. Les décisions de rejet ne sont pas publiées, les décisions d’acceptation doivent faire l’objet d’un avis au JORF confirmant que cette dernière est acquise. '
  },
  apw: {
    id: 'apw',
    nom: 'avis du préfet maritime',
    description: 'Avis pour les titres miniers en mer.'
  },
  ari: {
    id: 'ari',
    nom: 'avis de la réunion interservice',
    description: ''
  },
  ars: {
    id: 'ars',
    nom: "avis de l'agence régionale de santé",
    description: "Avis concernant leur respect de la réglementation sanitaire dans le cadre de l'instruction d'un titre minier ou d'une demande relative à la police des mines."
  },
  asl: {
    id: 'asl',
    nom: 'décision du propriétaire du sol',
    description: ''
  },
  ass: {
    id: 'ass',
    nom: 'avis de la caisse générale de sécurité sociale',
    description: "Avis émis par le service de la sécurité sociale sur la situation sociale de l'entreprise."
  },
  auc: {
    id: 'auc',
    nom: 'avis DGTM service aménagement, urbanisme, construction, logement (AUCL)',
    description: 'Avis de l’AUCL sur la notice d’impact pour les titres miniers et les autorisations d’exploitation. '
  },
  cac: {
    id: 'cac',
    nom: 'consultation des administrations centrales',
    description: ''
  },
  cim: {
    id: 'cim',
    nom: 'concertation interministérielle',
    description: 'Concertation prévue dans le cadre des exploitations de granulats marins par les ministères concernés.'
  },
  cod: {
    id: 'cod',
    nom: "saisine du conseil départemental de l'environnement et des risques sanitaires et technologiques  (Coderst)",
    description: ''
  },
  cps: {
    id: 'cps',
    nom: "confirmation de l'accord du propriétaire du sol",
    description: ''
  },
  css: { id: 'css', nom: 'classement sans suite', description: '' },
  dae: {
    id: 'dae',
    nom: 'décision de la mission autorité environnementale (examen au cas par cas du projet)',
    description: ''
  },
  dec: { id: 'dec', nom: 'déclaration', description: '' },
  def: {
    id: 'def',
    nom: "décision de l'Office national des forêts",
    description: 'Décision de l’ONF dans le cadre des autorisations d’exploitation (AEX) et des autorisations de recherches minières (ARM) en tant que propriétaire du sol.'
  },
  des: {
    id: 'des',
    nom: 'désistement du demandeur',
    description:
      'Le demandeur signifie son souhait de ne pas donner suite à sa demande. Le désistement met fin à la démarche. Le demandeur ne peut pas se désister de sa demande après qu’une décision ait été rendue sur celle-ci.'
  },
  dex: {
    id: 'dex',
    nom: "décision de l'administration",
    description: ''
  },
  dim: {
    id: 'dim',
    nom: 'décision implicite',
    description:
      'En dehors des décisions implicites, l’autorité administrative compétente (préfet, ministre chargé des mines ou gouvernement) peut prendre une décision express de refus ou d’acceptation par arrêté ou décret en conseil d’État (décision relative aux concessions minières).'
  },
  dpu: {
    id: 'dpu',
    nom: 'publication de décision au JORF',
    description:
      'En dehors des refus et décisions implicites de rejet, la décision de l’autorité compétente est publiée soit au recueil administratif de la préfecture soit au JORF pour les décisions du préfet et au JORF pour celle du ministre chargé des mines et du gouvernement. Ces publications pour les actes relatifs aux titres miniers sont publiés par extrait.'
  },
  dup: {
    id: 'dup',
    nom: 'publication de décision administrative au JORF',
    description:
      'A la fin d’une instruction, la décision administrative est publiée au JORF  si elle est positive. Pour les instructions relatives aux granulats marins, la décision administrative est publiée au JORF, qu’elle soit positive ou négative.'
  },
  dux: {
    id: 'dux',
    nom: 'décision administrative',
    description: 'Refus ou acceptation à l’issue d’une instruction.'
  },
  duy: {
    id: 'duy',
    nom: 'décision administrative',
    description: 'Refus ou acceptation à l’issue d’une instruction.'
  },
  ede: {
    id: 'ede',
    nom: 'expertise DREAL ou DGTM service eau',
    description: 'Instruction de demande sur la réglementation ayant trait à l’eau par les services de la DGTM.\n'
  },
  edm: {
    id: 'edm',
    nom: 'expertise DGTM service prévention des risques et industries extractives (DATE)',
    description: ''
  },
  eof: {
    id: 'eof',
    nom: "expertise de l'Office national des forêts",
    description: 'Expertise effectuée par l’ONF dans le cadre d’une demande d’autorisation de recherches minières (ARM).'
  },
  epc: {
    id: 'epc',
    nom: "clôture de l'enquête publique",
    description: 'L’enquête publique dure un mois. Il est possible de la prolonger. '
  },
  epu: {
    id: 'epu',
    nom: "ouverture de l'enquête publique",
    description: 'L’enquête publique requise pour l’octroi des concessions minières et des permis d’exploitations dans les départements d’outre-mer a lieu après constat de recevabilité du dossier.'
  },
  esb: {
    id: 'esb',
    nom: 'expertise DREAL ou DGTM service biodiversité',
    description: 'Instruction de demande sur la réglementation ayant trait à la biodiversité par les services de la DGTM.'
  },
  ide: {
    id: 'ide',
    nom: 'initiation de la démarche de retrait',
    description: 'Initiative de l’administration qui marque l’engagement d’une démarche de retrait.'
  },
  ihi: {
    id: 'ihi',
    nom: 'informations historiques incomplètes',
    description: 'Impossibilité de retracer la totalité de la vie administrative du titre.'
  },
  mca: {
    id: 'mca',
    nom: 'demande de compléments (recevabilité de la demande)',
    description: 'après une mcr'
  },
  mcb: {
    id: 'mcb',
    nom: "demande de compléments (récépissé de déclaration loi sur l'eau)",
    description: 'après une rde'
  },
  mcd: {
    id: 'mcd',
    nom: 'demande de compléments (décision de la mission autorité environnementale (examen au cas par cas du projet)',
    description: 'après une dae'
  },
  mcm: {
    id: 'mcm',
    nom: 'demande de compléments (complétude de la demande)',
    description: 'après une mcp'
  },
  mco: {
    id: 'mco',
    nom: 'demande de compléments',
    description:
      "Étape à l'initiative du service instructeur qui demande des compléments au demandeur et lui fixe un délai maximum pour les transmettre. Cette étape interrompt le décompte du délai dans lequel une décision doit être prise. Cette demande doit faire l'objet d'une lettre recommandée avec demande d'accusé de réception."
  },
  mcp: {
    id: 'mcp',
    nom: 'complétude de la demande',
    description:
      'Phase d’examen qui permet d’établir que toutes les pièces exigées par la réglementation sont bien fournies par le demandeur. Cet examen ne préjuge pas de la décision qui sera apportée par l’administration. '
  },
  mcr: {
    id: 'mcr',
    nom: 'recevabilité de la demande',
    description:
      'Acte de l’administration établissant que l’examen de complétude a été mené à bien. Le constat de recevabilité donne lieu à un rapport de la part de l’administration qui constate que le dossier de demande est complet. '
  },
  mcs: {
    id: 'mcs',
    nom: 'demande de compléments (saisine de la CARM)',
    description: 'après une sca'
  },
  mdp: {
    id: 'mdp',
    nom: 'dépôt de la demande',
    description:
      "Le dépôt de la demande formalise la prise en charge de la demande par l'administration compétente. Cette étape fait l’objet d’un accusé de réception qui informe le demandeur des modalités d’instruction, du délai au-delà duquel une décision implicite d’accord ou de rejet sera formée et des voies de recours."
  },
  mec: {
    id: 'mec',
    nom: 'avis de demande concurrente',
    description: 'Annonce à un demandeur qu’une demande concurrente à la sienne a été déposée.'
  },
  men: {
    id: 'men',
    nom: 'enregistrement de la demande',
    description: "L’enregistrement de la demande est une étape de gestion administrative interne du dossier qui se confond au dépôt de la demande lorsqu'elle est numérique et dématérialisée."
  },
  meo: {
    id: 'meo',
    nom: "prise en charge par l'Office national des forêts",
    description: ''
  },
  mfr: {
    id: 'mfr',
    nom: 'demande',
    description:
      'La demande caractérise le projet minier porté par le demandeur. Elle inclut les caractéristiques fondamentales du titre ou de l’autorisation dans une lettre appuyée par un dossier et les justifications des capacités techniques et financières. Les informations relevant du secret des affaires incluses à la demande peuvent ne pas être rendues publiques à la demande du porteur de projet.'
  },
  mia: {
    id: 'mia',
    nom: "demande d'informations (avis de l'Office national des forêts)",
    description: 'après une aof'
  },
  mie: {
    id: 'mie',
    nom: "demande d'informations (avis du DREAL, DEAL ou DGTM)",
    description: 'après une adp'
  },
  mif: {
    id: 'mif',
    nom: "demande d'informations",
    description: "Étape à l'initiative du service instructeur pour obtenir des informations qui ne sont pas de nature à interrompre le décompte du délai dans lequel une décision doit être prise. \n"
  },
  mim: {
    id: 'mim',
    nom: "demande d'informations (recevabilité de la demande)",
    description: 'après une mcr'
  },
  mio: {
    id: 'mio',
    nom: "demande d'informations (expertise de l'Office national des forêts)",
    description: 'après une eof'
  },
  mna: {
    id: 'mna',
    nom: 'notification au demandeur (ajournement de la CARM)',
    description: 'après une aca ajournée'
  },
  mnb: {
    id: 'mnb',
    nom: 'notification au demandeur (avis favorable de la CARM)',
    description: 'après une aca favorable'
  },
  mnc: {
    id: 'mnc',
    nom: 'notification au demandeur (classement sans suite)',
    description: 'après une css'
  },
  mnd: {
    id: 'mnd',
    nom: 'notification au demandeur (avis défavorable)',
    description: 'après une aca défavorable'
  },
  mni: {
    id: 'mni',
    nom: 'notification au demandeur (initiation de la démarche de retrait)',
    description: 'après une ide'
  },
  mno: {
    id: 'mno',
    nom: 'notification au demandeur',
    description: 'Notification de la décision au demandeur.'
  },
  mns: {
    id: 'mns',
    nom: 'notification au demandeur (signature de l’autorisation de recherche minière)',
    description: 'après une sco'
  },
  mnv: {
    id: 'mnv',
    nom: "notification au demandeur (signature de l'avenant à l’autorisation de recherche minière)",
    description: 'après une aco'
  },
  mod: {
    id: 'mod',
    nom: 'modification de la demande',
    description:
      'Le porteur modifie les caractéristiques fondamentales de sa demande. Cette modification ne change pas le délai de décision implicite. Les possibilités sont limitées au gré de l’avancement de la démarche, en particulier après la mise en concurrence et après la participation du public.\n'
  },
  mom: {
    id: 'mom',
    nom: 'modification de la demande (décision de la mission autorité environnementale (examen au cas par cas du projet)',
    description: 'après une dae'
  },
  ncl: {
    id: 'ncl',
    nom: 'notification des collectivités locales',
    description: 'Notification de la décision aux collectivités locales.'
  },
  nis: {
    id: 'nis',
    nom: 'note interne signalée',
    description: "Note confidentielle qui permet de faire connaître au sein de l'administration un certain nombre d'informations importantes. \n"
  },
  npp: {
    id: 'npp',
    nom: 'notification au préfet',
    description: 'Note au préfet demandant de notifier la décision à l’intéressé et de prendre les mesures de publicité nécessaires.'
  },
  pfc: {
    id: 'pfc',
    nom: 'paiement des frais de dossier complémentaires',
    description: 'Supplément de frais de dossier concernant uniquement les ARM mécanisées car elles nécessitent une expertise complémentaire (état des lieux par imagerie).\n'
  },
  pfd: {
    id: 'pfd',
    nom: 'paiement des frais de dossier',
    description: ''
  },
  pnr: {
    id: 'pnr',
    nom: 'avis du parc naturel régional',
    description: "Avis du parc naturel régional dans le cadre de l’instruction d’un titre ou d'une demande relative à la police des mines."
  },
  ppc: {
    id: 'ppc',
    nom: 'clôture de la participation du public',
    description: 'La durée de la participation du public doit être au moins égale 15 jours. L’administration doit tenir compte pour sa décision des avis recueillis lors de la participation du public.'
  },
  ppu: {
    id: 'ppu',
    nom: 'ouverture de la participation du public',
    description:
      'La participation du public est obligatoire pour l’octroi des permis exclusifs de recherches (PER) et les prolongations de concessions minières. La législation ne prévoit pas à quel moment elle intervient. Il a été décidé pour les titres miniers qu’elle aurait lieu dès la déclaration de recevabilité du dossier. '
  },
  pqr: {
    id: 'pqr',
    nom: 'publication dans un journal local ou national',
    description: ''
  },
  rca: {
    id: 'rca',
    nom: 'réception de compléments (recevabilité de la demande)',
    description: 'après une mcr'
  },
  rcb: {
    id: 'rcb',
    nom: "réception de compléments (récépissé de déclaration loi sur l'eau)",
    description: 'après une rde'
  },
  rcd: {
    id: 'rcd',
    nom: 'réception de compléments (décision de la mission autorité environnementale (examen au cas par cas du projet))',
    description: 'après une dae'
  },
  rcg: {
    id: 'rcg',
    nom: "rapport du conseil général de l'économie (CGE)",
    description: ''
  },
  rcm: {
    id: 'rcm',
    nom: 'réception de compléments (complétude de la demande)',
    description: 'après une mcp'
  },
  rco: {
    id: 'rco',
    nom: 'réception de compléments',
    description:
      'Étape par laquelle le service instructeur accuse réception des compléments transmis par le demandeur. Cette étape permet la reprise du décompte du délai dans lequel une décision doit être prise.'
  },
  rcs: {
    id: 'rcs',
    nom: 'réception de compléments (saisine de la CARM)',
    description: 'après une sca'
  },
  rde: {
    id: 'rde',
    nom: "récépissé de déclaration loi sur l'eau",
    description: 'Document nécessaire à l’utilisation de l’eau dans le cas d’une autorisation de recherches minières (ARM).'
  },
  ria: {
    id: 'ria',
    nom: "réception d'information (avis de l'Office national des forêts)",
    description: 'après une aof'
  },
  rie: {
    id: 'rie',
    nom: "réception d'information (avis du DREAL, DEAL ou DGTM)",
    description: 'après une adp'
  },
  rif: {
    id: 'rif',
    nom: "réception d'information",
    description: "Étape par laquelle le service instructeur reçoit l'information demandée."
  },
  rim: {
    id: 'rim',
    nom: "réception d'information (recevabilité de la demande)",
    description: 'après une mcr'
  },
  rio: {
    id: 'rio',
    nom: "réception d'information (expertise de l'Office national des forêts)",
    description: 'après une eof'
  },
  rpe: {
    id: 'rpe',
    nom: 'rapport du Conseil d’État',
    description: ''
  },
  rpu: {
    id: 'rpu',
    nom: 'publication de décision au recueil des actes administratifs',
    description: 'Publication, par le préfet, au recueil des actes administratifs.'
  },
  rtd: {
    id: 'rtd',
    nom: 'retrait de la décision',
    description: 'Sanction administrative consistant à retirer le titre minier dans les cas énumérés dans le code minier.'
  },
  sas: {
    id: 'sas',
    nom: "saisine de l'autorité signataire",
    description: ''
  },
  sca: {
    id: 'sca',
    nom: 'saisine de la commission des autorisations de recherches minières (CARM)',
    description: ''
  },
  scg: {
    id: 'scg',
    nom: "saisine du conseil général de l'économie (CGE)",
    description:
      "Étape par laquelle le service instructeur transmet la demande, les différents avis et une proposition de décision du ministre chargé des mines au conseil général de l'économie pour avis."
  },
  scl: {
    id: 'scl',
    nom: 'saisine des collectivités locales',
    description: 'Consultation pour avis, des collectivités locales dans le cadre de l’instruction d’un titre ou d’une autorisation.'
  },
  sco: {
    id: 'sco',
    nom: 'signature de l’autorisation de recherche minière',
    description:
      'Signature de l’autorisation par l’ONF seulement dans le cas d’ARM manuelles ou par les deux parties (ONF et demandeur) dans le cas d’ARM mécanisées pour acceptation de l’état des lieux par le demandeur et valant début de validité de celle-ci.'
  },
  spe: {
    id: 'spe',
    nom: "saisine du Conseil d'Etat",
    description: 'Le service instructeur transmet la demande, les différents avis et une proposition de décision du premier ministre et du ministre chargé des mines au conseil d’État pour avis.'
  },
  spo: {
    id: 'spo',
    nom: 'saisine de la commission départementale des mines (CDM)',
    description:
      'Dans les seuls départements d’Outre-mer (Guadeloupe, Guyane, Réunion, Martinique et Mayotte) une commission dédiée à l’examen des demandes minières se réunit comportant les différentes parties prenantes. Cette commission donne un avis consultatif sur le rapport des services déconcentrés. Pour l’instant, cette commission se réunit uniquement en Guyane.'
  },
  spp: {
    id: 'spp',
    nom: 'saisine du préfet',
    description: 'L’administration centrale transmet la demande au préfet pour qu’il engage son instruction locale.\n'
  },
  ssr: {
    id: 'ssr',
    nom: 'saisine des services',
    description:
      'Demande de consultation dans le cadre d’un titre minier des chefs de service civils et de l’autorité militaire. Les intéressés ont un mois pour répondre. Au-delà de ce délai,  le silence vaut accord.\n'
  },
  vfc: {
    id: 'vfc',
    nom: 'validation du paiement des frais de dossier complémentaires',
    description: 'Validation par la direction générale des territoires et des mines (DGTM).'
  },
  vfd: {
    id: 'vfd',
    nom: 'validation du paiement des frais de dossier',
    description: 'Acte attestant que le pétitionnaire d’une autorisation de recherches minières (ARM) a acquitté ses frais de dossier.\n'
  },
  wab: { id: 'wab', nom: 'Abandon de la demande', description: '' },
  wac: {
    id: 'wac',
    nom: 'avis de direction régionale des affaires culturelles - DRAC',
    description: ''
  },
  wad: {
    id: 'wad',
    nom: 'avis de la direction départementale des territoires et de la mer - DDT(M)',
    description: ''
  },
  wae: {
    id: 'wae',
    nom: "avis de l'autorité environnementale",
    description: ''
  },
  wai: {
    id: 'wai',
    nom: 'avis des autres instances',
    description: ''
  },
  wal: {
    id: 'wal',
    nom: "avis d'un service administratif local",
    description: ''
  },
  wam: {
    id: 'wam',
    nom: "avis de l'autorité militaire",
    description: ''
  },
  wao: {
    id: 'wao',
    nom: "arrêté d'ouverture des travaux miniers",
    description: "Arrêté d'ouverture des travaux miniers"
  },
  wap: { id: 'wap', nom: 'avis du préfet maritime', description: '' },
  war: { id: 'war', nom: 'avis de réception', description: '' },
  was: {
    id: 'was',
    nom: "avis de l'agence régionale de santé - ARS",
    description: ''
  },
  wat: {
    id: 'wat',
    nom: "avis du conseil départemental de l'environnement et des risques sanitaires et technologiques (Coderst)",
    description: ''
  },
  wau: {
    id: 'wau',
    nom: 'Avis du demandeur sur les prescriptions proposées',
    description: ''
  },
  wce: {
    id: 'wce',
    nom: "clôture de l'enquête publique",
    description: ''
  },
  wco: {
    id: 'wco',
    nom: 'Réception de compléments',
    description: ''
  },
  wda: {
    id: 'wda',
    nom: 'Donné acte de la déclaration (DOTM)',
    description: ''
  },
  wdc: {
    id: 'wdc',
    nom: 'demande de compléments (AOTM ou DOTM)',
    description: ''
  },
  wdd: { id: 'wdd', nom: 'dépot de la demande', description: '' },
  wde: {
    id: 'wde',
    nom: 'demande de compléments (DADT)',
    description: ''
  },
  wdm: {
    id: 'wdm',
    nom: "décision de l'administration",
    description: ''
  },
  wdt: {
    id: 'wdt',
    nom: 'avis de la DDT(M)',
    description: 'avis de la Direction Départementale des Territoires et de la Mer'
  },
  wfa: {
    id: 'wfa',
    nom: "Demande d'autorisation d'ouverture de travaux miniers (AOTM)",
    description: ''
  },
  wfd: {
    id: 'wfd',
    nom: "Déclaration d'arrêt définitif de travaux (DADT)",
    description: ''
  },
  wfo: {
    id: 'wfo',
    nom: "Déclaration d'ouverture de travaux miniers (DOTM)",
    description: ''
  },
  wfr: {
    id: 'wfr',
    nom: "Demande d'autorisation d'ouverture de travaux miniers (DAOTM)",
    description: ''
  },
  wmm: {
    id: 'wmm',
    nom: "memoire en réponse de l'exploitant (par rapport à l'avis de l'AE)",
    description: ''
  },
  wmr: {
    id: 'wmr',
    nom: "mémoire en réponse de l'exploitant",
    description: "mémoire en réponse de l'exploitant à l'avis d'autorité environnementale."
  },
  wmt: {
    id: 'wmt',
    nom: 'memoire de fin de travaux',
    description: ''
  },
  woe: {
    id: 'woe',
    nom: "ouverture de l'enquête publique",
    description: ''
  },
  wpa: {
    id: 'wpa',
    nom: 'publication de décision au recueil des actes administratifs',
    description: ''
  },
  wpb: {
    id: 'wpb',
    nom: 'porter-à-connaissance',
    description: 'Porter-à-connaissance'
  },
  wpc: {
    id: 'wpc',
    nom: 'Arrêté de prescriptions complémentaires',
    description: ''
  },
  wpo: {
    id: 'wpo',
    nom: 'Arrêté de second donner acte',
    description: ''
  },
  wpp: {
    id: 'wpp',
    nom: 'Arrêté préfectoral de premier donner acte (DADT)',
    description: ''
  },
  wps: {
    id: 'wps',
    nom: 'Arrêté préfectoral de sursis à statuer',
    description: ''
  },
  wrc: {
    id: 'wrc',
    nom: 'reception de compléments',
    description: ''
  },
  wrd: { id: 'wrd', nom: 'Rapport de la Dreal', description: '' },
  wre: { id: 'wre', nom: 'Recevabilité', description: '' },
  wrl: {
    id: 'wrl',
    nom: "Avis et rapport du directeur régional chargé de l'environnement, de l'aménagement et du logement",
    description: ''
  },
  wrt: { id: 'wrt', nom: 'récolement', description: '' },
  wse: {
    id: 'wse',
    nom: "saisine de l'autorité environnementale",
    description: ''
  },
  wss: {
    id: 'wss',
    nom: "saisine des services de l'Etat",
    description: ''
  },
  wtp: {
    id: 'wtp',
    nom: 'Transmission du projet de prescriptions au demandeur',
    description: ''
  }
}

export const isEtapeTypeId = (etapeTypeId: string): etapeTypeId is EtapeTypeId => {
  return etapesTypesIds.includes(etapeTypeId)
}
export const isEtapeTypeKey = (etapeTypeKey: string): etapeTypeKey is EtapeTypeKey => {
  return etapeTypeKey in ETAPES_TYPES
}
