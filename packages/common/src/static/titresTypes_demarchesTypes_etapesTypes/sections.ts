import { CaminoDate, toCaminoDate } from '../../date.js'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from '../demarchesTypes.js'
import { TITRES_TYPES_IDS, TitreTypeId } from '../titresTypes.js'
import { ETAPES_TYPES, EtapeTypeId } from './../etapesTypes.js'
import { TDEType } from './index.js'
import { DeepReadonly, isNotNullNorUndefined } from '../../typescript-tools.js'

const gestionDeLaDemandeDeComplements: Section[] = [
  {
    id: 'mcox',
    nom: 'Gestion de la demande de compléments',
    elements: [
      {
        id: 'delaifixe',
        nom: 'Délai fixé (jour)',
        type: 'number',
        optionnel: true,
        description:
          "Nombre de jours accordés pour produire les compléments demandés. Le delai au delà duquel une décision implicite se forme est suspendu dès réception de cette demande et jusqu'à la production des compléments. Au delà du délai fixé, la demande est suceptible d'être classée sans suite ou instruite en l'état."
      },
      {
        id: 'datear',
        nom: 'Accusé de réception',
        type: 'date',
        optionnel: true,
        description: "Date de l'accusé de réception de la demande de compléments à compter de laquelle commence à courrir le délai accordé pour produire les compléments."
      }
    ]
  }
]
const suiviDeLaDemarche: Section[] = [
  {
    id: 'suivi',
    nom: 'Suivi de la démarche',
    elements: [
      {
        id: 'dateReception',
        nom: 'Date de réception',
        type: 'date',
        optionnel: true,
        description: "Date de réception à compter de laquelle commence à courir le délai imparti pour signer l'autorisation ou un avenant"
      }
    ]
  }
]

const EtapesTypesSections = {
  [ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_]: [
    {
      id: 'mea',
      nom: 'Mission autorité environnementale',
      elements: [
        {
          id: 'arrete',
          nom: 'Arrêté préfectoral',
          type: 'text',
          optionnel: true,
          description: "Numéro de l'arrêté préfectoral portant décision dans le cadre de l’examen au cas par cas du projet d’autorisation de recherche minière"
        }
      ]
    }
  ],
  [ETAPES_TYPES.paiementDesFraisDeDossier]: [
    {
      id: 'paiement',
      nom: 'Informations sur le paiement',
      elements: [
        { id: 'frais', nom: 'Frais de dossier', type: 'number', optionnel: true, description: 'Montant en euro des frais de dossier payés' },
        { id: 'virement', nom: 'Virement banquaire ou postal', type: 'text', optionnel: true, description: 'Référence communiquée par le demandeur à sa banque' }
      ]
    }
  ],
  [ETAPES_TYPES.demandeDeComplements]: gestionDeLaDemandeDeComplements,
  [ETAPES_TYPES.demandeDeComplements_CompletudeDeLaDemande_]: gestionDeLaDemandeDeComplements,
  [ETAPES_TYPES.demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_]: gestionDeLaDemandeDeComplements,
  [ETAPES_TYPES.demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_]: gestionDeLaDemandeDeComplements,
  [ETAPES_TYPES.demandeDeComplements_RecevabiliteDeLaDemande_]: gestionDeLaDemandeDeComplements,
  [ETAPES_TYPES.demandeDeComplements_SaisineDeLaCARM_]: gestionDeLaDemandeDeComplements,
  [ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau]: [
    {
      id: 'deal',
      nom: 'DEAL',
      elements: [
        { id: 'numero-dossier-deal-eau', nom: 'Numéro de dossier', type: 'text', optionnel: true, description: 'Numéro de dossier DEAL Service eau' },
        { id: 'numero-recepisse', nom: 'Numéro de récépissé', type: 'text', optionnel: true, description: 'Numéro de récépissé émis par la DEAL Service eau' }
      ]
    }
  ],
  [ETAPES_TYPES.validationDuPaiementDesFraisDeDossier]: [
    { id: 'paiement', nom: 'Informations sur le paiement', elements: [{ id: 'facture', nom: 'Facture ONF', type: 'text', optionnel: true, description: "Numéro de facture émise par l'ONF" }] }
  ],
  [ETAPES_TYPES.expertiseDREALOuDGTMServiceEau]: [
    {
      id: 'deal',
      nom: 'DEAL service eau',
      elements: [
        { id: 'motifs', nom: 'Motifs', type: 'textarea', optionnel: true, description: "élément d'expertise" },
        { id: 'agent', nom: 'Agent', type: 'text', optionnel: true, description: "Prénom et nom de l'agent chargé de l'expertise" }
      ]
    }
  ],
  [ETAPES_TYPES.expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_]: [
    {
      id: 'deal',
      nom: 'DEAL service mines',
      elements: [
        { id: 'motifs', nom: 'Motifs', type: 'textarea', optionnel: true, description: "élément d'expertise" },
        { id: 'agent', nom: 'Agent', type: 'text', optionnel: true, description: "Prénom et nom de l'agent chargé de l'expertise" }
      ]
    }
  ],
  [ETAPES_TYPES.notificationAuPrefet]: [
    {
      id: 'nppx',
      nom: 'Note au préfet',
      elements: [
        { id: 'info', nom: 'Informations complémentaires', type: 'textarea', optionnel: true, description: 'Informations complémentaires accompagnant la notification de la décision au préfet' }
      ]
    }
  ],
  [ETAPES_TYPES.notificationAuDemandeur]: suiviDeLaDemarche,
  [ETAPES_TYPES.notificationAuDemandeur_AjournementDeLaCARM_]: [
    { id: 'suivi', nom: 'Suivi de la démarche', elements: [{ id: 'dateReception', nom: 'Date de réception', type: 'date', optionnel: true, description: 'Date de réception de la notification' }] }
  ],
  [ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_]: suiviDeLaDemarche,
  [ETAPES_TYPES.notificationAuDemandeur_ClassementSansSuite_]: suiviDeLaDemarche,
  [ETAPES_TYPES.notificationAuDemandeur_AvisDefavorable_]: suiviDeLaDemarche,
  [ETAPES_TYPES.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_]: suiviDeLaDemarche,
  [ETAPES_TYPES.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_]: suiviDeLaDemarche,
  [ETAPES_TYPES.notificationAuDemandeur_InitiationDeLaDemarcheDeRetrait_]: suiviDeLaDemarche,
  [ETAPES_TYPES.paiementDesFraisDeDossierComplementaires]: [
    {
      id: 'paiement',
      nom: 'Informations sur le paiement',
      elements: [
        { id: 'fraisComplementaires', nom: 'Frais de dossier complémentaires', type: 'number', optionnel: true, description: 'Montant en euro des frais de dossier complémentaires payés' },
        { id: 'virement', nom: 'Virement banquaire ou postal', type: 'text', optionnel: true, description: 'Référence communiquée par le demandeur à sa banque' }
      ]
    }
  ],
  [ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires]: [
    { id: 'paiement', nom: 'Informations sur le paiement', elements: [{ id: 'facture', nom: 'Facture ONF', type: 'text', optionnel: true, description: "Numéro de facture émise par l'ONF" }] }
  ],
  [ETAPES_TYPES.noteInterneSignalee]: [
    {
      id: 'nisi',
      nom: 'Note interne signalée',
      elements: [
        {
          id: 'note',
          nom: "Notes réservées à l'administration",
          type: 'textarea',
          optionnel: true,
          description: "Informations internes importantes pour la compréhension du suivi de l'instruction de la démarche"
        }
      ]
    }
  ]
} as const satisfies { [key in EtapeTypeId]?: DeepReadonly<Section[]> }

const proprietesDeLaConcession: Section[] = [
  {
    id: 'cxx',
    nom: 'Propriétés de la concession',
    elements: [
      { id: 'volume', nom: 'Volume', type: 'number', optionnel: true },
      { id: 'volumeUniteId', nom: 'Unité du volume', type: 'select', optionnel: true, description: '', valeursMetasNom: 'unites' }
    ]
  }
]

const proprietesDuPermisExclusifDeRecherches: Section[] = [
  {
    id: 'prx',
    nom: 'Propriétés du permis exclusif de recherches',
    elements: [
      { id: 'engagement', nom: 'Engagement', type: 'number', optionnel: true },
      { id: 'engagementDeviseId', nom: "Devise de l'engagement", type: 'select', optionnel: true, description: '', valeursMetasNom: 'devises' }
    ]
  }
]

const proprietesDuPermisDExploitation: Section[] = [
  {
    id: 'pxx',
    nom: "Propriétés du permis d'exploitation",
    elements: [
      { id: 'volume', nom: 'Volume', type: 'number', optionnel: true, description: 'Volume' },
      { id: 'volumeUniteId', nom: 'Unité du volume', type: 'select', optionnel: true, description: '', valeursMetasNom: 'unites' }
    ]
  }
]

const caracteristiquesARM: Section[] = [
  {
    id: 'arm',
    nom: 'Caractéristiques ARM',
    elements: [
      { id: 'mecanise', nom: 'Prospection mécanisée', type: 'radio', description: '' },
      { id: 'franchissements', nom: "Franchissements de cours d'eau", type: 'integer', optionnel: true, description: "Nombre de franchissements de cours d'eau" }
    ]
  }
]

const TDESections = {
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: {
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.receptionDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet__]: [
        { id: 'arm', nom: 'Caractéristiques ARM', elements: [{ id: 'mecanise', nom: 'Prospection mécanisée', type: 'radio', description: '' }] }
      ],
      [ETAPES_TYPES.receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_]: [
        {
          id: 'arm',
          nom: 'Caractéristiques ARM',
          elements: [{ id: 'franchissements', nom: "Franchissements de cours d'eau", type: 'integer', optionnel: true, description: "Nombre de franchissements de cours d'eau" }]
        }
      ],
      [ETAPES_TYPES.demande]: caracteristiquesARM,
      [ETAPES_TYPES.modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_]: caracteristiquesARM,
      [ETAPES_TYPES.modificationDeLaDemande]: caracteristiquesARM,
      [ETAPES_TYPES.completudeDeLaDemande]: [
        {
          id: 'armInstructeurCompletude',
          nom: 'Instructeur Pôle technique minier de Guyane',
          elements: [{ id: 'agent', nom: 'Agent', type: 'text', optionnel: true, description: "Prénom et nom de l'agent PTMG en charge d'établir la complétude de la demande" }]
        },
        {
          id: 'armDemandeur',
          nom: 'Identification du demandeur',
          elements: [
            {
              id: 'entreprise',
              nom: 'Entreprise',
              type: 'checkbox',
              description:
                "L'entreprise porteuse de la demande est identifiées (extrait Kbis de moins d’un an, déclaration INSEE du statut d’Auto Entrepreneur, justificatif de création de société en cours, (présence code SIRET et APE)."
            },
            {
              id: 'representantLegal',
              nom: 'Représentant légal',
              type: 'checkbox',
              description:
                "Le réprésentant légal de l'entité porteuse de la demande est identifié (Identité, coordonnées, justificatif d'identité - CNI / passeport / carte de résident en cours de validité)."
            },
            { id: 'motifsIdentification', nom: 'Motifs identification demandeur', type: 'textarea', optionnel: true, description: '' }
          ]
        },
        {
          id: 'armCaracteristiques',
          nom: "Caractéristiques de l'autorisation de recherche",
          elements: [
            { id: 'nomSecteur', nom: 'Nom de secteur', type: 'checkbox', description: "Le nom de secteur est cohérent avec l'appellation courante de l'ARM." },
            { id: 'duree', nom: 'Durée', type: 'checkbox', description: "L'autorisation est demandée pour une durée maximum de 4 mois à compter de la date de l'autorisation." },
            {
              id: 'descriptionProjet',
              nom: 'Description du projet de recherches minières ',
              type: 'checkbox',
              description: 'Le projet de recherches minières est décrit : le programme de prospection, les méthodes de travail projetées, les moyens techniques mobilisés, les moyens humains employés.'
            },
            {
              id: 'surfaceDemandee',
              nom: 'Surfaces demandées',
              type: 'checkbox',
              description:
                "Les surfaces demandées n'excéde pas 3 km², sous la forme de 1 à 3 carrés ou rectangles d'une superficie de 1 km² chacun, tous situés sur le même bassin versant. Les carrés mesurent 1 km de côté et les rectangles 0,5 km de largeur et 2 km de longueur. L'espacement de leurs centres n'est pas supérieur à 4 km."
            },
            {
              id: 'surfaceMaximumDetenue',
              nom: 'Surfaces maximum détenues',
              type: 'checkbox',
              description: "L'opérateur ne détient pas d'autorisation de recherches sur une surface supérieure à 3 km²."
            },
            {
              id: 'localisationPerimetres',
              nom: 'Localisation des périmètres',
              type: 'checkbox',
              description:
                'Les périmètres est transmis dans un fichier numérique réutilisable (au format ".geojson"). Le système de coordonnées légal en vigueur est le RGFG95 (ESPG: 2972) avec une précision métrique.'
            },
            {
              id: 'cheminements',
              nom: 'Cheminements prévisionnels à emprunter',
              type: 'checkbox',
              description: "Ces tracés sont élaborés uniquement à partir du réseau carrossable, jusqu'à et à l'intérieur de l'ARM."
            },
            {
              id: 'localisationCheminements',
              nom: 'Localisation des cheminements prévisionnels à emprunter',
              type: 'checkbox',
              description:
                'L\'ensemble de ces tracés est transmis dans un fichier numérique réutilisable (au format ".geojson"). Le système de coordonnées légal en vigueur est le RGFG95 (ESPG: 2972) avec une précision métrique.'
            },
            { id: 'carte500000', nom: 'Carte synthétique 1/500 000', type: 'checkbox', description: 'Le document cartographique inclut les périmètres demandés' },
            {
              id: 'carte50000',
              nom: 'Carte synthétique 1/50 000',
              type: 'checkbox',
              description: 'Le document cartographique inclut les périmètres demandés, le tracé des cheminements prévisionnels à emprunter, la position des points de franchissement.'
            },
            { id: 'motifsDemande', nom: 'Motifs caractéristiques de la demande', type: 'textarea', optionnel: true, description: '' }
          ]
        },
        {
          id: 'armMecanisee',
          nom: 'Informations sur la prospection mécanisée',
          elements: [
            { id: 'recepisseLSE', nom: "Dossier loi sur l'eau", type: 'checkbox', description: "Le dossier de déclaration loi sur l'eau est présent." },
            {
              id: 'recepisseCasParCas',
              nom: "Décision d'examen au cas par cas",
              type: 'checkbox',
              description: "L'étape de décision dans le cadre de l'examen au cas par cas est présente et favorable."
            },
            { id: 'franchissementsCoursDeau', nom: "Franchissements de cours d'eau", type: 'checkbox', description: "Les franchissements de cours d'eau sont indiqués." },
            {
              id: 'localisationPointsFranchissementsCoursDeau',
              nom: "Localisation des points de franchissement de cours d'eau",
              type: 'checkbox',
              description:
                'L\'ensemble de ces point est transmis dans un fichier numérique réutilisable (au format ".geojson"). Le système de coordonnées légal en vigueur est le RGFG95 (ESPG: 2972) avec une précision métrique.'
            },
            { id: 'descriptionMateriel', nom: 'Description du matériel', type: 'checkbox', description: 'Le matériel utilisé et son origine (acquisition, location) sont décrits.' },
            { id: 'tonnageMaximum', nom: 'Tonnage maximum autorisé', type: 'checkbox', description: 'Le tonnage maximum des pelles mécaniques autorisées fixé à 21 tonnes est respecté.' },
            { id: 'motifsMateriel', nom: 'Motifs caractéristiques matériel', type: 'textarea', optionnel: true, description: '' }
          ]
        },
        {
          id: 'armInformationTechniques',
          nom: 'Informations techniques',
          elements: [
            {
              id: 'justificatifsCapacitesTechniques',
              nom: 'Justificatifs des capacités techniques',
              type: 'checkbox',
              description:
                "La justification des capacités techniques s'appuie sur la présentation de l'activité professionnelle actuelle et les références professionnelles en matière minière du demandeur (curriculum vitae, ou à défaut, les formations suivies). S'il s'agit d'une personne morale les références professionnelles des cadres chargés du suivi et de la conduite des travaux sont présentées."
            },
            {
              id: 'responsableTravaux',
              nom: 'Responsable des travaux',
              type: 'checkbox',
              description: "Le responsable des travaux est identifié (Identité, coordonnées, justificatif d'identité - CNI / passeport / carte de résident en cours de validité)."
            },
            { id: 'motifsCapaciteTechniques', nom: 'Motifs capacité techniques', type: 'textarea', optionnel: true, description: '' }
          ]
        },
        {
          id: 'armInformationFinancieres',
          nom: 'Informations financières',
          elements: [
            {
              id: 'planFinancement',
              nom: 'Plan de financement',
              type: 'checkbox',
              description: 'Le plan inclut le montant de la dépense totale envisagée en euros pour conduire la prospection et le plan prévisionnel de financement associé.'
            },
            {
              id: 'justificationCapacitesFinancieres',
              nom: 'Justificatifs des capacités financières',
              type: 'checkbox',
              description:
                "La démonstration des capacités financières à exercer une activité d'exploration comporte la justification des ressources financières disponibles correspondant au plan de financement."
            },
            {
              id: 'justificatifSituationFiscale',
              nom: 'Justificatif de situation fiscale',
              type: 'checkbox',
              description:
                "La justification de situation fiscale régulière est présentée (attestation ou justificatif des services fiscaux, déclaration unique DGFIP, moratoire accordé par la même autorité) excepté pour les sociétés créées dans l'année."
            },
            { id: 'motifsCapaciteFinancieres', nom: 'Motifs capacités financières', type: 'textarea', optionnel: true, description: '' }
          ]
        },
        {
          id: 'armInformationComplétude',
          nom: 'Informations complémentaires',
          elements: [
            {
              id: 'informationsCompletude',
              nom: 'Informations complémentaires',
              type: 'textarea',
              optionnel: true,
              description: "Informations complémentaires à l'examen de la complétude de la demande portées à la connaissance du demandeur."
            }
          ]
        }
      ],
      [ETAPES_TYPES.receptionDeComplements_RecevabiliteDeLaDemande_]: caracteristiquesARM,
      [ETAPES_TYPES.receptionDeComplements_CompletudeDeLaDemande_]: caracteristiquesARM,
      [ETAPES_TYPES.receptionDinformation_RecevabiliteDeLaDemande_]: caracteristiquesARM,
      [ETAPES_TYPES.expertiseDeLOfficeNationalDesForets]: [
        {
          id: 'onf',
          nom: 'Office National des Forêts',
          elements: [
            { id: 'motifs', nom: 'Motifs', type: 'textarea', optionnel: true, description: "Élément d'expertise" },
            { id: 'expert', nom: 'Expert', type: 'text', optionnel: true, description: "Agent ONF qui a réalisé l'expertise" },
            { id: 'agent', nom: 'Agent', type: 'text', optionnel: true, description: 'Chargé de mission foncier du Service Aménagement du Territoire' },
            {
              id: 'dateDebut',
              nom: 'Date de début',
              type: 'date',
              dateFin: toCaminoDate('2018-02-07'),
              dateDebut: toCaminoDate('2003-07-24'),
              optionnel: true,
              description: 'Date de début de l’expertise'
            }
          ]
        }
      ],
      [ETAPES_TYPES.avisDeLOfficeNationalDesForets]: [
        {
          id: 'onf',
          nom: 'Office National des Forêts',
          elements: [
            { id: 'motifs', nom: 'Motifs', type: 'textarea', optionnel: true, description: "Élément d'expertise" },
            {
              id: 'signataire',
              nom: 'Signataire',
              type: 'text',
              optionnel: true,
              description: 'Directeur ONF ou responsable du service Service Aménagement du Territoire qui apparaitra sur les documents externe pour signature'
            }
          ]
        }
      ],
      [ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere]: [
        { id: 'arm', nom: 'Caractéristiques ARM', elements: [{ id: 'mecanise', nom: 'Prospection mécanisée', type: 'radio' }] },
        {
          id: 'suivi',
          nom: 'Suivi de la démarche',
          elements: [
            { id: 'signataire', nom: 'Signataire ONF', type: 'text', optionnel: true, description: "Prénom et nom du représentant légal du titulaire de l'ONF" },
            { id: 'titulaire', nom: 'Signataire titulaire', type: 'text', optionnel: true, description: "Prénom et nom du représentant légal du titulaire de l'autorisation" }
          ]
        }
      ]
    }
  },
  [TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS]: {
    [DEMARCHES_TYPES_IDS.AutorisationDOuvertureDeTravaux]: {
      [ETAPES_TYPES.arreteDouvertureDesTravauxMiniers]: [
        {
          id: 'cxx',
          nom: "Propriétés de l'arrêté d'ouverture de travaux",
          elements: [
            { id: 'volume', nom: 'Volume', type: 'number', optionnel: true },
            { id: 'volumeUniteId', nom: 'Unité du volume', type: 'select', optionnel: true, description: '', valeursMetasNom: 'unites' }
          ]
        }
      ]
    },
    [DEMARCHES_TYPES_IDS.Amodiation]: {
      [ETAPES_TYPES.demande]: proprietesDeLaConcession,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDeLaConcession,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDeLaConcession
    },
    [DEMARCHES_TYPES_IDS.ExtensionDePerimetre]: {
      [ETAPES_TYPES.demande]: proprietesDeLaConcession,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDeLaConcession,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDeLaConcession
    },
    [DEMARCHES_TYPES_IDS.Mutation]: {
      [ETAPES_TYPES.demande]: proprietesDeLaConcession,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDeLaConcession,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDeLaConcession
    },
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: proprietesDeLaConcession,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDeLaConcession,
      [ETAPES_TYPES.receptionDeComplements]: proprietesDeLaConcession,
      [ETAPES_TYPES.receptionDinformation]: proprietesDeLaConcession,
      [ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF]: proprietesDeLaConcession,
      [ETAPES_TYPES.decisionImplicite]: proprietesDeLaConcession,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDeLaConcession,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDeLaConcession,
      [ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs]: proprietesDeLaConcession,
      [ETAPES_TYPES.retraitDeLaDecision]: proprietesDeLaConcession,
      [ETAPES_TYPES.abrogationDeLaDecision]: proprietesDeLaConcession,
      [ETAPES_TYPES.decisionDuJugeAdministratif]: proprietesDeLaConcession,
      [ETAPES_TYPES.informationsHistoriquesIncompletes]: proprietesDeLaConcession
    },
    [DEMARCHES_TYPES_IDS.Prolongation]: {
      [ETAPES_TYPES.demande]: proprietesDeLaConcession,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDeLaConcession,
      [ETAPES_TYPES.receptionDeComplements]: proprietesDeLaConcession,
      [ETAPES_TYPES.receptionDinformation]: proprietesDeLaConcession,
      [ETAPES_TYPES.publicationDeLavisDeDecisionImplicite]: proprietesDeLaConcession,
      [ETAPES_TYPES.saisineDeLautoriteSignataire]: proprietesDeLaConcession,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDeLaConcession,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDeLaConcession,
      [ETAPES_TYPES.decisionDuJugeAdministratif]: proprietesDeLaConcession,
      [ETAPES_TYPES.informationsHistoriquesIncompletes]: proprietesDeLaConcession
    },
    [DEMARCHES_TYPES_IDS.Renonciation]: {
      [ETAPES_TYPES.demande]: proprietesDeLaConcession,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDeLaConcession,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDeLaConcession
    },
    [DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation]: {
      [ETAPES_TYPES.demande]: proprietesDeLaConcession,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDeLaConcession,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDeLaConcession
    },
    [DEMARCHES_TYPES_IDS.Retrait]: {
      [ETAPES_TYPES.decisionAdministrative]: proprietesDeLaConcession,
      [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: proprietesDeLaConcession
    }
  },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE]: {
    [DEMARCHES_TYPES_IDS.ExtensionDePerimetre]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Fusion]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Mutation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation1]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation2]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Renonciation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Retrait]: {
      [ETAPES_TYPES.decisionAdministrative]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: proprietesDuPermisExclusifDeRecherches
    }
  },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_HYDROCARBURE]: {
    [DEMARCHES_TYPES_IDS.ExtensionDePerimetre]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Fusion]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Mutation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation1]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation2]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.ProlongationExceptionnelle]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Renonciation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Retrait]: {
      [ETAPES_TYPES.decisionAdministrative]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: proprietesDuPermisExclusifDeRecherches
    }
  },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: {
    [DEMARCHES_TYPES_IDS.ExtensionDePerimetre]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Renonciation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Retrait]: {
      [ETAPES_TYPES.decisionAdministrative]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.ExtensionDeSubstance]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Fusion]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Mutation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation1]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation2]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    }
  },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF]: {
    [DEMARCHES_TYPES_IDS.ExtensionDePerimetre]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Fusion]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Mutation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation1]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation2]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Renonciation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Retrait]: {
      [ETAPES_TYPES.decisionAdministrative]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: proprietesDuPermisExclusifDeRecherches
    }
  },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN]: {
    [DEMARCHES_TYPES_IDS.ExtensionDePerimetre]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Fusion]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Mutation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation1]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation2]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Renonciation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Retrait]: {
      [ETAPES_TYPES.decisionAdministrative]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: proprietesDuPermisExclusifDeRecherches
    }
  },
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS]: {
    [DEMARCHES_TYPES_IDS.Renonciation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.ExtensionDePerimetre]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Fusion]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Mutation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation1]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Prolongation2]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisExclusifDeRecherches
    },
    [DEMARCHES_TYPES_IDS.Retrait]: {
      [ETAPES_TYPES.decisionAdministrative]: proprietesDuPermisExclusifDeRecherches,
      [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: proprietesDuPermisExclusifDeRecherches
    }
  },
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS]: {
    [DEMARCHES_TYPES_IDS.Amodiation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisDExploitation
    },
    [DEMARCHES_TYPES_IDS.ExtensionDePerimetre]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisDExploitation
    },
    [DEMARCHES_TYPES_IDS.Renonciation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisDExploitation
    },
    [DEMARCHES_TYPES_IDS.Mutation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisDExploitation
    },
    [DEMARCHES_TYPES_IDS.Octroi]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisDExploitation
    },
    [DEMARCHES_TYPES_IDS.Prolongation1]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisDExploitation
    },
    [DEMARCHES_TYPES_IDS.Prolongation2]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisDExploitation
    },
    [DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation]: {
      [ETAPES_TYPES.demande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.modificationDeLaDemande]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.decisionDeLadministration]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.publicationDeDecisionAuJORF]: proprietesDuPermisDExploitation
    },
    [DEMARCHES_TYPES_IDS.Prorogation]: {
      [ETAPES_TYPES.decisionAdministrative]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: proprietesDuPermisDExploitation
    },
    [DEMARCHES_TYPES_IDS.Retrait]: {
      [ETAPES_TYPES.decisionAdministrative]: proprietesDuPermisDExploitation,
      [ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF]: proprietesDuPermisDExploitation
    }
  }
} as const satisfies {
  [titreKey in keyof TDEType]?: {
    [demarcheKey in keyof TDEType[titreKey]]?: {
      [key in Extract<TDEType[titreKey][demarcheKey], readonly EtapeTypeId[]>[number]]?: DeepReadonly<Section[]>
    }
  }
}

export interface Section {
  id: string
  nom?: string
  elements: SectionsElement[]
}

export type BasicElement = {
  id: string
  nom?: string
  description?: string
  dateDebut?: CaminoDate
  dateFin?: CaminoDate
  optionnel?: boolean
}

export type DateElement = {
  type: 'date'
} & BasicElement

export type FileElement = {
  type: 'file'
} & BasicElement

export type TextElement = {
  type: 'text' | 'textarea'
} & BasicElement

export type NumberElement = {
  type: 'number' | 'integer'
} & BasicElement

export type RadioElement = {
  type: 'radio' | 'checkbox'
} & BasicElement

export type CheckboxesElement = {
  type: 'checkboxes'
  options: { id: string; nom: string }[]
} & BasicElement

export type SelectElement = {
  type: 'select'
} & (
  | { options: { id: string; nom: string }[] }
  | {
      valeursMetasNom: 'devises' | 'unites'
    }
) &
  BasicElement

export type SectionsElement = FileElement | DateElement | TextElement | NumberElement | RadioElement | CheckboxesElement | SelectElement

type EtapesTypesEtapesTypesSections = keyof typeof EtapesTypesSections

const isEtapesTypesEtapesTypesSections = (etapeTypeId?: EtapeTypeId): etapeTypeId is EtapesTypesEtapesTypesSections => {
  return Object.keys(EtapesTypesSections).includes(etapeTypeId)
}

export const getSections = (titreTypeId?: TitreTypeId, demarcheId?: DemarcheTypeId, etapeTypeId?: EtapeTypeId): DeepReadonly<Section>[] => {
  if (isNotNullNorUndefined(titreTypeId) && isNotNullNorUndefined(demarcheId) && isNotNullNorUndefined(etapeTypeId)) {
    const sections: DeepReadonly<Section>[] = []

    type TDESectionsTypesUnleashed = { [key in TitreTypeId]?: { [key in DemarcheTypeId]?: { [key in EtapeTypeId]?: DeepReadonly<Section[]> } } }

    sections.push(...((TDESections as TDESectionsTypesUnleashed)[titreTypeId]?.[demarcheId]?.[etapeTypeId] ?? []))

    if (isEtapesTypesEtapesTypesSections(etapeTypeId)) {
      EtapesTypesSections[etapeTypeId].forEach(section => {
        if (!sections.some(({ id }) => id === section.id)) {
          sections.push(section)
        }
      })
    }

    return sections
  } else {
    throw new Error(`il manque des éléments pour trouver les sections titreTypeId: '${titreTypeId}', demarcheId: ${demarcheId}, etapeTypeId: ${etapeTypeId}`)
  }
}
