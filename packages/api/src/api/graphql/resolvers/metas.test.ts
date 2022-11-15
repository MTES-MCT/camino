import { etapesTypesPossibleACetteDateOuALaPlaceDeLEtape } from './metas'
import TitresDemarches from '../../../database/models/titres-demarches'
import { IEtapeType } from '../../../types'
import { newDemarcheId } from '../../../database/models/_format/id-create'
import { ArmOctMachine } from '../../../business/rules-demarches/arm/oct.machine'
import { toCaminoDate } from 'camino-common/src/date'

describe('etapesTypesPossibleACetteDateOuALaPlaceDeLEtape', function () {
  const demarche: Pick<TitresDemarches, 'etapes'> = {
    etapes: [
      {
        id: 'etapeId16',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'sco',
        statutId: 'fai',
        ordre: 16,
        date: toCaminoDate('2020-08-17'),
        contenu: { arm: { mecanise: true } },
        slug: 'demarcheSlug-sco01'
      },
      {
        id: 'etapeId1',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'mfr',
        statutId: 'fai',
        ordre: 1,
        date: toCaminoDate('2019-09-19'),
        slug: 'demarcheSlug-mfr01',
        contenu: { arm: { mecanise: true, franchissements: 19 } }
      },
      {
        id: 'etapeId5',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'mcp',
        statutId: 'com',
        ordre: 5,
        date: toCaminoDate('2019-11-27'),
        slug: 'demarcheSlug-mcp01'
      },
      {
        id: 'etapeId10',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'aof',
        statutId: 'fav',
        ordre: 10,
        date: toCaminoDate('2019-12-04'),
        slug: 'demarcheSlug-aof01'
      },
      {
        id: 'etapeId9',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'eof',
        statutId: 'fai',
        ordre: 9,
        date: toCaminoDate('2019-12-04'),
        slug: 'demarcheSlug-eof01'
      },
      {
        id: 'etapeId14',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'pfc',
        statutId: 'fai',
        ordre: 14,
        date: toCaminoDate('2020-05-22'),
        slug: 'demarcheSlug-pfc01'
      },
      {
        id: 'etapeId8',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'mcr',
        statutId: 'fav',
        ordre: 8,
        date: toCaminoDate('2019-12-04'),
        slug: 'demarcheSlug-mcr01'
      },
      {
        id: 'etapeId4',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'pfd',
        statutId: 'fai',
        ordre: 4,
        date: toCaminoDate('2019-11-20'),
        slug: 'demarcheSlug-pfd01'
      },
      {
        id: 'etapeId15',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'vfc',
        statutId: 'fai',
        ordre: 15,
        date: toCaminoDate('2020-05-22'),
        slug: 'demarcheSlug-vfc01'
      },
      {
        id: 'etapeId13',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'mnb',
        statutId: 'fai',
        ordre: 13,
        date: toCaminoDate('2020-05-18'),
        slug: 'demarcheSlug-mnb01'
      },
      {
        id: 'etapeId12',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'aca',
        statutId: 'fav',
        ordre: 12,
        date: toCaminoDate('2020-05-13'),
        slug: 'demarcheSlug-aca01'
      },
      {
        id: 'etapeId6',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'rde',
        statutId: 'fav',
        ordre: 6,
        date: toCaminoDate('2019-12-04'),
        slug: 'demarcheSlug-rde01',
        contenu: { arm: { franchissements: 19 } }
      },
      {
        id: 'etapeId2',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'mdp',
        statutId: 'fai',
        ordre: 2,
        date: toCaminoDate('2019-09-20'),
        slug: 'demarcheSlug-mdp01'
      },
      {
        id: 'etapeId7',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'vfd',
        statutId: 'fai',
        ordre: 7,
        date: toCaminoDate('2019-12-04'),
        slug: 'demarcheSlug-vfd01'
      },
      {
        id: 'etapeId11',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'sca',
        statutId: 'fai',
        ordre: 11,
        date: toCaminoDate('2020-05-04'),
        slug: 'demarcheSlug-sca01'
      },
      {
        id: 'etapeId3',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'dae',
        statutId: 'exe',
        ordre: 3,
        date: toCaminoDate('2019-10-11'),
        slug: 'demarcheSlug-dae01'
      },
      {
        id: 'etapeId17',
        titreDemarcheId: newDemarcheId('demarcheId'),
        typeId: 'aco',
        statutId: 'fai',
        ordre: 17,
        date: toCaminoDate('2022-05-05'),
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
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
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
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'mcd',
      nom: 'demande de compléments (décision de la mission autorité environnementale (examen au cas par cas du projet)',
      description: 'après une dae',
      ordre: 18,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
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
      etapesCreation: true
    },
    {
      id: 'rcd',
      nom: 'réception de compléments (décision de la mission autorité environnementale (examen au cas par cas du projet))',
      description: 'après une dae',
      ordre: 24,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'mcb',
      nom: "demande de compléments (récépissé de déclaration loi sur l'eau)",
      description: 'après une rde',
      ordre: 19,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
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
      etapesCreation: true
    },
    {
      id: 'rcb',
      nom: "réception de compléments (récépissé de déclaration loi sur l'eau)",
      description: 'après une rde',
      ordre: 25,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'dae',
      nom: 'décision de la mission autorité environnementale (examen au cas par cas du projet)',

      ordre: 9,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
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
      etapesCreation: true
    },
    {
      id: 'mom',
      nom: 'modification de la demande (décision de la mission autorité environnementale (examen au cas par cas du projet)',
      description: 'après une dae',
      ordre: 15,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
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
      dateFin: '2018-01-01',
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
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
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'pfd',
      nom: 'paiement des frais de dossier',

      ordre: 13,
      fondamentale: null,
      unique: true,
      acceptationAuto: null,
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
      etapesCreation: true
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
      etapesCreation: true
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
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'mca',
      nom: 'demande de compléments (recevabilité de la demande)',
      description: 'après une mcr',
      ordre: 20,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
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
      etapesCreation: true
    },
    {
      id: 'rca',
      nom: 'réception de compléments (recevabilité de la demande)',
      description: 'après une mcr',
      ordre: 26,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'mcm',
      nom: 'demande de compléments (complétude de la demande)',
      description: 'après une mcp',
      ordre: 17,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
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
      etapesCreation: true
    },
    {
      id: 'rcm',
      nom: 'réception de compléments (complétude de la demande)',
      description: 'après une mcp',
      ordre: 23,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'mim',
      nom: "demande d'informations (recevabilité de la demande)",
      description: 'après une mcr',
      ordre: 29,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'rim',
      nom: "réception d'information (recevabilité de la demande)",
      description: 'après une mcr',
      ordre: 35,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
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
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'meo',
      nom: "prise en charge par l'Office national des forêts",

      ordre: 45,
      fondamentale: null,
      unique: true,
      acceptationAuto: null,
      dateFin: '2020-01-01',
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'edm',
      nom: 'expertise DGTM service prévention des risques et industries extractives (DATE)',

      ordre: 57,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
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
      etapesCreation: true
    },
    {
      id: 'css',
      nom: 'classement sans suite',

      ordre: 102,
      fondamentale: null,
      unique: true,
      acceptationAuto: null,
      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'mnc',
      nom: 'notification au demandeur (classement sans suite)',
      description: 'après une css',
      ordre: 116,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
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
      etapesCreation: true
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
      etapesCreation: true
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
      etapesCreation: true
    },
    {
      id: 'mio',
      nom: "demande d'informations (expertise de l'Office national des forêts)",
      description: 'après une eof',
      ordre: 30,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'rio',
      nom: "réception d'information (expertise de l'Office national des forêts)",
      description: 'après une eof',
      ordre: 36,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,

      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
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

      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: false,
      etapesCreation: true
    },
    {
      id: 'mcs',
      nom: 'demande de compléments (saisine de la CARM)',
      description: 'après une sca',
      ordre: 21,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,

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
      etapesCreation: true
    },
    {
      id: 'rcs',
      nom: 'réception de compléments (saisine de la CARM)',
      description: 'après une sca',
      ordre: 27,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,

      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'mia',
      nom: "demande d'informations (avis de l'Office national des forêts)",
      description: 'après une aof',
      ordre: 33,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,

      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'ria',
      nom: "réception d'information (avis de l'Office national des forêts)",
      description: 'après une aof',
      ordre: 39,
      fondamentale: true,
      unique: null,
      acceptationAuto: null,

      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true
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

      dateFin: null,
      sections: null,
      publicLecture: false,
      entreprisesLecture: false,
      etapesCreation: true
    },
    {
      id: 'sca',
      nom: 'saisine de la commission des autorisations de recherches minières (CARM)',

      ordre: 88,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,

      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'aca',
      nom: 'avis de la commission des autorisations de recherches minières (CARM)',

      ordre: 89,
      fondamentale: true,
      unique: true,
      acceptationAuto: null,

      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'mna',
      nom: 'notification au demandeur (ajournement de la CARM)',
      description: 'après une aca ajournée',
      ordre: 114,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,

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
      etapesCreation: true
    },
    {
      id: 'mnd',
      nom: 'notification au demandeur (avis défavorable)',
      description: 'après une aca défavorable',
      ordre: 117,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,

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
      etapesCreation: true
    },
    {
      id: 'mnb',
      nom: 'notification au demandeur (avis favorable de la CARM)',
      description: 'après une aca favorable',
      ordre: 115,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,

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
      etapesCreation: true
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
      etapesCreation: true
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
      etapesCreation: true
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

      dateFin: '2018-10-22',
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
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

      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
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

      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'mns',
      nom: 'notification au demandeur (signature de l’autorisation de recherche minière)',
      description: 'après une sco',
      ordre: 118,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,

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
      etapesCreation: true
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

      dateFin: null,
      sections: null,
      publicLecture: true,
      entreprisesLecture: true,
      etapesCreation: true
    },
    {
      id: 'mnv',
      nom: "notification au demandeur (signature de l'avenant à l’autorisation de recherche minière)",
      description: 'après une aco',
      ordre: 119,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,

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
      etapesCreation: true
    }
  ]
  const machine = new ArmOctMachine()
  test('modifie une étape existante', () => {
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      machine,
      demarche,
      'etapeId3',
      toCaminoDate('2019-10-11'),
      etapesTypes
    )
    expect(etapes).toHaveLength(1)
    expect(etapes.map(({ id }) => id)).toStrictEqual(['dae'])
  })

  test('modifie une étape existante à la même date devrait permettre de recréer la même étape', () => {
    for (const etape of demarche?.etapes ?? []) {
      const etapesTypesPossibles =
        etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
          machine,
          demarche,
          etape.id,
          etape.date,
          etapesTypes
        )
      if (etapesTypesPossibles.length === 0) {
        console.error(
          `pas d'étapes possibles à l'étape ${JSON.stringify(
            etape
          )}. Devrait contenir AU MOINS la même étape`
        )
      }
      expect(etapesTypesPossibles.length).toBeGreaterThan(0)
      expect(etapesTypesPossibles.map(({ id }) => id)).toContain(etape.typeId)
    }
  })

  test('ajoute une nouvelle étape à la fin', () => {
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      machine,
      demarche,
      undefined,
      toCaminoDate('2022-05-06'),
      etapesTypes
    )
    expect(etapes).toHaveLength(1)
    expect(etapes[0].id).toBe('mnv')
  })

  test('ajoute une nouvelle étape en plein milieu', () => {
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      machine,
      demarche,
      undefined,
      toCaminoDate('2019-12-04'),
      etapesTypes
    )
    expect(etapes.map(({ id }) => id)).toStrictEqual(['mod'])
  })

  test('peut faire une dae, une rde et pfd AVANT la mfr', () => {
    const demarche: Pick<TitresDemarches, 'etapes'> = {
      etapes: [
        {
          id: 'idMfr',
          titreDemarcheId: newDemarcheId(''),
          typeId: 'mfr',
          statutId: 'fai',
          date: toCaminoDate('2022-05-16'),
          contenu: { arm: { mecanise: true, franchissements: 2 } }
        },
        {
          id: 'idMdp',
          titreDemarcheId: newDemarcheId(''),
          typeId: 'mdp',
          statutId: 'fai',
          date: toCaminoDate('2022-05-17')
        }
      ]
    }
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      machine,
      demarche,
      undefined,
      toCaminoDate('2019-12-04'),
      etapesTypes
    )
    expect(etapes.map(({ id }) => id)).toStrictEqual(['dae', 'pfd', 'rde'])
  })

  test('peut faire que une pfd AVANT la mfr non mecanisee', () => {
    const demarche: Pick<TitresDemarches, 'etapes'> = {
      etapes: [
        {
          id: 'idMfr',
          titreDemarcheId: newDemarcheId(''),
          typeId: 'mfr',
          statutId: 'fai',
          date: toCaminoDate('2022-05-16'),
          contenu: { arm: { mecanise: false } }
        },
        {
          id: 'idMdp',
          titreDemarcheId: newDemarcheId(''),
          typeId: 'mdp',
          statutId: 'fai',
          date: toCaminoDate('2022-05-17')
        }
      ]
    }
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      machine,
      demarche,
      undefined,
      toCaminoDate('2019-12-04'),
      etapesTypes
    )
    expect(etapes.map(({ id }) => id)).toStrictEqual(['pfd'])
  })
  test('peut faire une completude (mcp) le même jour que le dépôt (mdp) de la demande', () => {
    const demarche: Pick<TitresDemarches, 'etapes'> = {
      etapes: [
        {
          id: 'id3',
          titreDemarcheId: newDemarcheId(''),
          typeId: 'mfr',
          statutId: 'fai',
          date: toCaminoDate('2022-06-23'),
          contenu: {
            arm: {
              mecanise: true,
              franchissements: 4
            }
          },
          ordre: 3
        },
        {
          id: 'id1',
          titreDemarcheId: newDemarcheId(''),
          typeId: 'dae',
          statutId: 'exe',
          date: toCaminoDate('2021-06-22'),
          ordre: 1
        },
        {
          id: 'id4',
          titreDemarcheId: newDemarcheId(''),
          typeId: 'mdp',
          statutId: 'fai',
          date: toCaminoDate('2022-07-01'),
          ordre: 4
        },
        {
          id: 'id2',
          titreDemarcheId: newDemarcheId(''),
          typeId: 'pfd',
          statutId: 'fai',
          date: toCaminoDate('2021-07-05'),
          ordre: 2
        }
      ]
    }
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      machine,
      demarche,
      undefined,
      toCaminoDate('2022-07-01'),
      etapesTypes
    )
    expect(etapes.map(({ id }) => id)).toStrictEqual([
      'mcb',
      'mod',
      'mcp',
      'css',
      'rde',
      'des'
    ])
  })
})
