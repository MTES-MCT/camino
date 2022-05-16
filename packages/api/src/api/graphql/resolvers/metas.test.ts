import { etapesTypesPossibleACetteDateOuALaPlaceDeLEtape } from './metas'
import TitresDemarches from '../../../database/models/titres-demarches'
import { IEtapeType } from '../../../types'

describe('etapesTypesPossibleACetteDateOuALaPlaceDeLEtape', function () {
  const demarche: Pick<TitresDemarches, 'etapes'> = {
    etapes: [
      {
        id: 'etapeId16',
        titreDemarcheId: 'demarcheId',
        typeId: 'sco',
        statutId: 'fai',
        ordre: 16,
        date: '2020-08-17',
        contenu: { arm: { mecanise: true } },
        slug: 'demarcheSlug-sco01'
      },
      {
        id: 'etapeId1',
        titreDemarcheId: 'demarcheId',
        typeId: 'mfr',
        statutId: 'fai',
        ordre: 1,
        date: '2019-09-23',
        slug: 'demarcheSlug-mfr01',
        contenu: { arm: { mecanise: true, franchissements: 19 } }
      },
      {
        id: 'etapeId5',
        titreDemarcheId: 'demarcheId',
        typeId: 'mcp',
        statutId: 'com',
        ordre: 5,
        date: '2019-11-27',
        slug: 'demarcheSlug-mcp01'
      },
      {
        id: 'etapeId10',
        titreDemarcheId: 'demarcheId',
        typeId: 'aof',
        statutId: 'fav',
        ordre: 10,
        date: '2019-12-04',
        slug: 'demarcheSlug-aof01'
      },
      {
        id: 'etapeId9',
        titreDemarcheId: 'demarcheId',
        typeId: 'eof',
        statutId: 'fai',
        ordre: 9,
        date: '2019-12-04',
        slug: 'demarcheSlug-eof01'
      },
      {
        id: 'etapeId14',
        titreDemarcheId: 'demarcheId',
        typeId: 'pfc',
        statutId: 'fai',
        ordre: 14,
        date: '2020-05-22',
        slug: 'demarcheSlug-pfc01'
      },
      {
        id: 'etapeId8',
        titreDemarcheId: 'demarcheId',
        typeId: 'mcr',
        statutId: 'fav',
        ordre: 8,
        date: '2019-12-04',
        slug: 'demarcheSlug-mcr01'
      },
      {
        id: 'etapeId4',
        titreDemarcheId: 'demarcheId',
        typeId: 'pfd',
        statutId: 'fai',
        ordre: 4,
        date: '2019-11-20',
        slug: 'demarcheSlug-pfd01'
      },
      {
        id: 'etapeId15',
        titreDemarcheId: 'demarcheId',
        typeId: 'vfc',
        statutId: 'fai',
        ordre: 15,
        date: '2020-05-22',
        slug: 'demarcheSlug-vfc01'
      },
      {
        id: 'etapeId13',
        titreDemarcheId: 'demarcheId',
        typeId: 'mnb',
        statutId: 'fai',
        ordre: 13,
        date: '2020-05-18',
        slug: 'demarcheSlug-mnb01'
      },
      {
        id: 'etapeId12',
        titreDemarcheId: 'demarcheId',
        typeId: 'aca',
        statutId: 'fav',
        ordre: 12,
        date: '2020-05-13',
        slug: 'demarcheSlug-aca01'
      },
      {
        id: 'etapeId6',
        titreDemarcheId: 'demarcheId',
        typeId: 'rde',
        statutId: 'fav',
        ordre: 6,
        date: '2019-12-04',
        slug: 'demarcheSlug-rde01'
      },
      {
        id: 'etapeId2',
        titreDemarcheId: 'demarcheId',
        typeId: 'mdp',
        statutId: 'fai',
        ordre: 2,
        date: '2019-11-21',
        slug: 'demarcheSlug-mdp01'
      },
      {
        id: 'etapeId7',
        titreDemarcheId: 'demarcheId',
        typeId: 'vfd',
        statutId: 'fai',
        ordre: 7,
        date: '2019-12-04',
        slug: 'demarcheSlug-vfd01'
      },
      {
        id: 'etapeId11',
        titreDemarcheId: 'demarcheId',
        typeId: 'sca',
        statutId: 'fai',
        ordre: 11,
        date: '2020-05-04',
        slug: 'demarcheSlug-sca01'
      },
      {
        id: 'etapeId3',
        titreDemarcheId: 'demarcheId',
        typeId: 'dae',
        statutId: 'exe',
        ordre: 3,
        date: '2019-10-11',
        slug: 'demarcheSlug-dae01'
      },
      {
        id: 'etapeId17',
        titreDemarcheId: 'demarcheId',
        typeId: 'aco',
        statutId: 'fai',
        ordre: 17,
        date: '2022-05-05',
        slug: 'demarcheSlug-aco01'
      }
    ]
  }

  // TODO 2022-05-09 sortir EtapeType de la base et le mettre dans le common
  const etapesTypes: IEtapeType[] = [
    {
      id: 'mfr',
      nom: 'demande',
      description:
        'La demande caractérise le projet minier porté par le demandeur. Elle inclut les caractéristiques fondamentales du titre ou de l’autorisation dans une lettre appuyée par un dossier et les justifications des capacités techniques et financières. Les informations relevant du secret des affaires incluses à la demande peuvent ne pas être rendues publiques à la demande du porteur de projet.',
      ordre: 1,
      fondamentale: true,
      unique: true,
      acceptationAuto: true,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        {
          id: 'aco',
          nom: 'en construction',

          couleur: 'warning'
        },
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mdp',
      nom: 'dépôt de la demande',
      description:
        "Le dépôt de la demande formalise la prise en charge de la demande par l'administration compétente. Cette étape fait l’objet d’un accusé de réception qui informe le demandeur des modalités d’instruction, du délai au-delà duquel une décision implicite d’accord ou de rejet sera formée et des voies de recours.",
      ordre: 6,
      fondamentale: null,
      unique: true,
      acceptationAuto: true,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mcd',
      nom: 'demande de compléments (décision de la mission autorité environnementale (examen au cas par cas du projet)',
      description: 'après une dae',
      ordre: 18,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
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
              description:
                "Date de l'accusé de réception de la demande de compléments à compter de laquelle commence à courrir le délai accordé pour produire les compléments."
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'rcd',
      nom: 'réception de compléments (décision de la mission autorité environnementale (examen au cas par cas du projet))',
      description: 'après une dae',
      ordre: 24,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mcb',
      nom: "demande de compléments (récépissé de déclaration loi sur l'eau)",
      description: 'après une rde',
      ordre: 19,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
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
              description:
                "Date de l'accusé de réception de la demande de compléments à compter de laquelle commence à courrir le délai accordé pour produire les compléments."
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'rcb',
      nom: "réception de compléments (récépissé de déclaration loi sur l'eau)",
      description: 'après une rde',
      ordre: 25,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'dae',
      nom: 'décision de la mission autorité environnementale (examen au cas par cas du projet)',

      ordre: 9,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'mea',
          nom: 'Mission autorité environnementale',
          elements: [
            {
              id: 'arrete',
              nom: 'Arrêté préfectoral',
              type: 'text',
              optionnel: true,
              description:
                "Numéro de l'arrêté préfectoral portant décision dans le cadre de l’examen au cas par cas du projet d’autorisation de recherche minière"
            }
          ]
        }
      ],
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        {
          id: 'exe',
          nom: 'exempté',

          couleur: 'success'
        },
        { id: 'req', nom: 'requis',  couleur: 'neutral' }
      ]
    },
    {
      id: 'mom',
      nom: 'modification de la demande (décision de la mission autorité environnementale (examen au cas par cas du projet)',
      description: 'après une dae',
      ordre: 15,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'men',
      nom: 'enregistrement de la demande',
      description:
        "L’enregistrement de la demande est une étape de gestion administrative interne du dossier qui se confond au dépôt de la demande lorsqu'elle est numérique et dématérialisée.",
      ordre: 8,
      fondamentale: null,
      unique: true,
      acceptationAuto: true,
      dateDebut: null,
      dateFin: '2018-01-01',
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mod',
      nom: 'modification de la demande',
      description:
        'Le porteur modifie les caractéristiques fondamentales de sa demande. Cette modification ne change pas le délai de décision implicite. Les possibilités sont limitées au gré de l’avancement de la démarche, en particulier après la mise en concurrence et après la participation du public.\n',
      ordre: 14,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'pfd',
      nom: 'paiement des frais de dossier',

      ordre: 13,
      fondamentale: null,
      unique: true,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'paiement',
          nom: 'Informations sur le paiement',
          elements: [
            {
              id: 'frais',
              nom: 'Frais de dossier',
              type: 'number',
              optionnel: true,
              description: 'Montant en euro des frais de dossier payés'
            },
            {
              id: 'virement',
              nom: 'Virement banquaire ou postal',
              type: 'text',
              optionnel: true,
              description: 'Référence communiquée par le demandeur à sa banque'
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'vfd',
      nom: 'validation du paiement des frais de dossier',
      description:
        'Acte attestant que le pétitionnaire d’une autorisation de recherches minières (ARM) a acquitté ses frais de dossier.\n',
      ordre: 46,
      fondamentale: null,
      unique: true,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'paiement',
          nom: 'Informations sur le paiement',
          elements: [
            {
              id: 'facture',
              nom: 'Facture ONF',
              type: 'text',
              optionnel: true,
              description: "Numéro de facture émise par l'ONF"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mcp',
      nom: 'complétude de la demande',
      description:
        'Phase d’examen qui permet d’établir que toutes les pièces exigées par la réglementation sont bien fournies par le demandeur. Cet examen ne préjuge pas de la décision qui sera apportée par l’administration. ',
      ordre: 40,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        {
          id: 'com',
          nom: 'complet',

          couleur: 'success'
        },
        { id: 'inc', nom: 'incomplet',  couleur: 'error' }
      ]
    },
    {
      id: 'mca',
      nom: 'demande de compléments (recevabilité de la demande)',
      description: 'après une mcr',
      ordre: 20,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
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
              description:
                "Date de l'accusé de réception de la demande de compléments à compter de laquelle commence à courrir le délai accordé pour produire les compléments."
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'rca',
      nom: 'réception de compléments (recevabilité de la demande)',
      description: 'après une mcr',
      ordre: 26,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mcm',
      nom: 'demande de compléments (complétude de la demande)',
      description: 'après une mcp',
      ordre: 17,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
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
              description:
                "Date de l'accusé de réception de la demande de compléments à compter de laquelle commence à courrir le délai accordé pour produire les compléments."
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'rcm',
      nom: 'réception de compléments (complétude de la demande)',
      description: 'après une mcp',
      ordre: 23,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mim',
      nom: "demande d'informations (recevabilité de la demande)",
      description: 'après une mcr',
      ordre: 29,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'rim',
      nom: "réception d'information (recevabilité de la demande)",
      description: 'après une mcr',
      ordre: 35,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mcr',
      nom: 'recevabilité de la demande',
      description:
        'Acte de l’administration établissant que l’examen de complétude a été mené à bien. Le constat de recevabilité donne lieu à un rapport de la part de l’administration qui constate que le dossier de demande est complet. ',
      ordre: 41,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        {
          id: 'fav',
          nom: 'favorable',

          couleur: 'success'
        },
        { id: 'def', nom: 'défavorable',  couleur: 'error' }
      ]
    },
    {
      id: 'meo',
      nom: "prise en charge par l'Office national des forêts",

      ordre: 45,
      fondamentale: null,
      unique: true,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: '2020-01-01',
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'edm',
      nom: 'expertise DGTM service prévention des risques et industries extractives (DATE)',

      ordre: 57,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'deal',
          nom: 'DEAL service mines',
          elements: [
            {
              id: 'motifs',
              nom: 'Motifs',
              type: 'textarea',
              optionnel: true,
              description: "élément d'expertise"
            },
            {
              id: 'agent',
              nom: 'Agent',
              type: 'text',
              optionnel: true,
              description: "Prénom et nom de l'agent chargé de l'expertise"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: false,
      etapesCreation: true,
      etapesStatuts: [
        {
          id: 'fav',
          nom: 'favorable',

          couleur: 'success'
        },
        { id: 'def', nom: 'défavorable',  couleur: 'error' }
      ]
    },
    {
      id: 'css',
      nom: 'classement sans suite',

      ordre: 102,
      fondamentale: null,
      unique: true,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mnc',
      nom: 'notification au demandeur (classement sans suite)',
      description: 'après une css',
      ordre: 116,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la démarche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de réception',
              type: 'date',
              optionnel: true,
              description:
                "Date de réception à compter de laquelle commence à courir le délai imparti pour signer l'autorisation"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mid',
      nom: "demande d'informations (expertise DGTM / DATE)",
      description: 'après une edm',
      ordre: 31,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'rid',
      nom: "réception d'information (expertise DGTM / DATE)",
      description: 'après une edm',
      ordre: 37,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'ede',
      nom: 'expertise DREAL ou DGTM service eau',
      description:
        'Instruction de demande sur la réglementation ayant trait à l’eau par les services de la DGTM.\n',
      ordre: 56,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'deal',
          nom: 'DEAL service eau',
          elements: [
            {
              id: 'motifs',
              nom: 'Motifs',
              type: 'textarea',
              optionnel: true,
              description: "élément d'expertise"
            },
            {
              id: 'agent',
              nom: 'Agent',
              type: 'text',
              optionnel: true,
              description: "Prénom et nom de l'agent chargé de l'expertise"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: false,
      etapesCreation: true,
      etapesStatuts: [
        {
          id: 'fav',
          nom: 'favorable',

          couleur: 'success'
        },
        { id: 'def', nom: 'défavorable',  couleur: 'error' }
      ]
    },
    {
      id: 'rde',
      nom: "récépissé de déclaration loi sur l'eau",
      description:
        'Document nécessaire à l’utilisation de l’eau dans le cas d’une autorisation de recherches minières (ARM).',
      ordre: 43,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'arm',
          nom: 'Caractéristiques ARM',
          elements: [
            {
              id: 'franchissements',
              nom: "Franchissements de cours d'eau",
              type: 'integer',
              optionnel: true,
              description: "Nombre de franchissements de cours d'eau"
            }
          ]
        },
        {
          id: 'deal',
          nom: 'DEAL',
          elements: [
            {
              id: 'numero-dossier-deal-eau',
              nom: 'Numéro de dossier',
              type: 'text',
              optionnel: true,
              description: 'Numéro de dossier DEAL Service eau'
            },
            {
              id: 'numero-recepisse',
              nom: 'Numéro de récépissé',
              type: 'text',
              optionnel: true,
              description: 'Numéro de récépissé émis par la DEAL Service eau'
            }
          ]
        }
      ],
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        {
          id: 'fav',
          nom: 'favorable',

          couleur: 'success'
        },
        { id: 'def', nom: 'défavorable',  couleur: 'error' }
      ]
    },
    {
      id: 'mio',
      nom: "demande d'informations (expertise de l'Office national des forêts)",
      description: 'après une eof',
      ordre: 30,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'rio',
      nom: "réception d'information (expertise de l'Office national des forêts)",
      description: 'après une eof',
      ordre: 36,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'eof',
      nom: "expertise de l'Office national des forêts",
      description:
        'Expertise effectuée par l’ONF dans le cadre d’une demande d’autorisation de recherches minières (ARM).',
      ordre: 59,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: false,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mcs',
      nom: 'demande de compléments (saisine de la CARM)',
      description: 'après une sca',
      ordre: 21,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
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
              description:
                "Date de l'accusé de réception de la demande de compléments à compter de laquelle commence à courrir le délai accordé pour produire les compléments."
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'rcs',
      nom: 'réception de compléments (saisine de la CARM)',
      description: 'après une sca',
      ordre: 27,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mia',
      nom: "demande d'informations (avis de l'Office national des forêts)",
      description: 'après une aof',
      ordre: 33,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'ria',
      nom: "réception d'information (avis de l'Office national des forêts)",
      description: 'après une aof',
      ordre: 39,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'aof',
      nom: "avis de l'Office national des forêts",
      description:
        'Avis délivré par l’ONF dans le cadre de l’instruction d’un titre minier.\n',
      ordre: 60,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: false,
      etapesCreation: true,
      etapesStatuts: [
        {
          id: 'fav',
          nom: 'favorable',

          couleur: 'success'
        },
        {
          id: 'fre',
          nom: 'favorable avec réserves',

          couleur: 'warning'
        },
        { id: 'def', nom: 'défavorable',  couleur: 'error' },
        {
          id: 'dre',
          nom: 'défavorable avec réserves',

          couleur: 'warning'
        }
      ]
    },
    {
      id: 'sca',
      nom: 'saisine de la commission des autorisations de recherches minières (CARM)',

      ordre: 88,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'aca',
      nom: 'avis de la commission des autorisations de recherches minières (CARM)',

      ordre: 89,
      fondamentale: true,
      unique: true,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        {
          id: 'fav',
          nom: 'favorable',

          couleur: 'success'
        },
        { id: 'def', nom: 'défavorable',  couleur: 'error' },
        {
          id: 'ajo',
          nom: 'ajourné',

          couleur: 'warning'
        }
      ]
    },
    {
      id: 'mna',
      nom: 'notification au demandeur (ajournement de la CARM)',
      description: 'après une aca ajournée',
      ordre: 114,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la démarche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de réception',
              type: 'date',
              optionnel: true,
              description: 'Date de réception de la notification'
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mnd',
      nom: 'notification au demandeur (avis défavorable)',
      description: 'après une aca défavorable',
      ordre: 117,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la démarche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de réception',
              type: 'date',
              optionnel: true,
              description:
                "Date de réception à compter de laquelle commence à courir le délai imparti pour signer l'autorisation"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mnb',
      nom: 'notification au demandeur (avis favorable de la CARM)',
      description: 'après une aca favorable',
      ordre: 115,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la démarche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de réception',
              type: 'date',
              optionnel: true,
              description:
                "Date de réception à compter de laquelle commence à courir le délai imparti pour signer l'autorisation"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'pfc',
      nom: 'paiement des frais de dossier complémentaires',
      description:
        'Supplément de frais de dossier concernant uniquement les ARM mécanisées car elles nécessitent une expertise complémentaire (état des lieux par imagerie).\n',
      ordre: 122,
      fondamentale: null,
      unique: true,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'paiement',
          nom: 'Informations sur le paiement',
          elements: [
            {
              id: 'fraisComplementaires',
              nom: 'Frais de dossier complémentaires',
              type: 'number',
              optionnel: true,
              description:
                'Montant en euro des frais de dossier complémentaires payés'
            },
            {
              id: 'virement',
              nom: 'Virement banquaire ou postal',
              type: 'text',
              optionnel: true,
              description: 'Référence communiquée par le demandeur à sa banque'
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'vfc',
      nom: 'validation du paiement des frais de dossier complémentaires',
      description:
        'Validation par la direction générale des territoires et des mines (DGTM).',
      ordre: 123,
      fondamentale: null,
      unique: true,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'paiement',
          nom: 'Informations sur le paiement',
          elements: [
            {
              id: 'facture',
              nom: 'Facture ONF',
              type: 'text',
              optionnel: true,
              description: "Numéro de facture émise par l'ONF"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'def',
      nom: "décision de l'Office national des forêts",
      description:
        'Décision de l’ONF dans le cadre des autorisations d’exploitation (AEX) et des autorisations de recherches minières (ARM) en tant que propriétaire du sol.',
      ordre: 70,
      fondamentale: true,
      unique: true,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: '2018-10-22',
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        {
          id: 'acc',
          nom: 'accepté',
          description:
            "La demande a fait l’objet d’une décision favorable de l'administration.",
          couleur: 'success'
        },
        {
          id: 'rej',
          nom: 'rejeté',
          description:
            "La demande a fait l’objet d’une décision défavorable de l'administration. Les textes d’applications du code minier prévoient que les décisions de rejet ne font pas l’objet d’une publication. En conséquence, les démarches qui passent au statut “rejeté” dans Camino sont dé-publiées et rendues inaccessibles aux tiers.\n",
          couleur: 'error'
        }
      ]
    },
    {
      id: 'des',
      nom: 'désistement du demandeur',
      description:
        'Le demandeur signifie son souhait de ne pas donner suite à sa demande. Le désistement met fin à la démarche. Le demandeur ne peut pas se désister de sa demande après qu’une décision ait été rendue sur celle-ci.',
      ordre: 12,
      fondamentale: null,
      unique: true,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'sco',
      nom: 'signature de l’autorisation de recherche minière',
      description:
        'Signature de l’autorisation par l’ONF seulement dans le cas d’ARM manuelles ou par les deux parties (ONF et demandeur) dans le cas d’ARM mécanisées pour acceptation de l’état des lieux par le demandeur et valant début de validité de celle-ci.',
      ordre: 124,
      fondamentale: true,
      unique: true,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mns',
      nom: 'notification au demandeur (signature de l’autorisation de recherche minière)',
      description: 'après une sco',
      ordre: 118,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la démarche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de réception',
              type: 'date',
              optionnel: true,
              description:
                "Date de réception à compter de laquelle commence à courir le délai imparti pour signer l'autorisation"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'aco',
      nom: 'avenant à l’autorisation de recherche minière',
      description:
        'Document (courrier) validant une demande de renouvellement et actant la prolongation de la durée de l’autorisation.',
      ordre: 125,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    },
    {
      id: 'mnv',
      nom: "notification au demandeur (signature de l'avenant à l’autorisation de recherche minière)",
      description: 'après une aco',
      ordre: 119,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la démarche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de réception',
              type: 'date',
              optionnel: true,
              description:
                "Date de réception à compter de laquelle commence à courir le délai imparti pour signer l'autorisation"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [
        { id: 'fai', nom: 'fait',  couleur: 'success' }
      ]
    }
  ]

  test('modifie une étape existante', () => {
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      demarche,
      'etapeId3',
      '2019-10-11',
      etapesTypes
    )
    expect(etapes).toHaveLength(1)
    expect(etapes.map(({ id }) => id)).toStrictEqual([
      'dae',
    ])
  })

  test('modifie une étape existante à la même date devrait permettre de recréer la même étape', () => {
    for (const etape of demarche?.etapes ?? []) {
      const etapesTypesPossibles =
        etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
          demarche,
          etape.id,
          etape.date,
          etapesTypes
        )
        if( etapesTypesPossibles.length === 0){
            console.log('boom', etape.typeId)
        }
      expect(etapesTypesPossibles.length).toBeGreaterThan(0)
      expect(etapesTypesPossibles.map(({ id }) => id)).toContain(etape.typeId)
    }
  })

  test('ajoute une nouvelle étape à la fin', () => {
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      demarche,
      undefined,
      '2022-05-06',
      etapesTypes
    )
    expect(etapes).toHaveLength(1)
    expect(etapes[0].id).toBe('mnv')
  })

  test.only('ajoute une nouvelle étape en plein milieu', () => {
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      demarche,
      undefined,
      '2019-12-04',
      etapesTypes
    )
    expect(etapes.map(({ id }) => id)).toStrictEqual([
      'mcb',
      'mod',
    ])
  })

  test('peut faire une dae, rde et pfd AVANT la mfr', () => {
    const demarche = {etapes: [
        {id: 'idMfr', titreDemarcheId: '', typeId: 'mfr', statutId: 'fai', date: '2022-05-16'},
        {id: 'idMdp', titreDemarcheId: '', typeId: 'mdp', statutId: 'fai', date: '2022-05-17'}
      ]}
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      demarche,
      undefined,
      '2019-12-04',
      etapesTypes
    )
    // expect(etapes).toHaveLength(2)
    expect(etapes.map(({ id }) => id)).toStrictEqual([
      'mcb',
      'mod',
    ])
  })
})
