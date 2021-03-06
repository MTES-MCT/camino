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
        date: '2019-09-19',
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
        slug: 'demarcheSlug-rde01',
        contenu: { arm: { franchissements: 19 } }
      },
      {
        id: 'etapeId2',
        titreDemarcheId: 'demarcheId',
        typeId: 'mdp',
        statutId: 'fai',
        ordre: 2,
        date: '2019-09-20',
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
        'La demande caract??rise le projet minier port?? par le demandeur. Elle inclut les caract??ristiques fondamentales du titre ou de l???autorisation dans une lettre appuy??e par un dossier et les justifications des capacit??s techniques et financi??res. Les informations relevant du secret des affaires incluses ?? la demande peuvent ne pas ??tre rendues publiques ?? la demande du porteur de projet.',
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
        { id: 'fai', nom: 'fait', couleur: 'success' }
      ]
    },
    {
      id: 'mdp',
      nom: 'd??p??t de la demande',
      description:
        "Le d??p??t de la demande formalise la prise en charge de la demande par l'administration comp??tente. Cette ??tape fait l???objet d???un accus?? de r??ception qui informe le demandeur des modalit??s d???instruction, du d??lai au-del?? duquel une d??cision implicite d???accord ou de rejet sera form??e et des voies de recours.",
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mcd',
      nom: 'demande de compl??ments (d??cision de la mission autorit?? environnementale (examen au cas par cas du projet)',
      description: 'apr??s une dae',
      ordre: 18,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'mcox',
          nom: 'Gestion de la demande de compl??ments',
          elements: [
            {
              id: 'delaifixe',
              nom: 'D??lai fix?? (jour)',
              type: 'number',
              optionnel: true,
              description:
                "Nombre de jours accord??s pour produire les compl??ments demand??s. Le delai au del?? duquel une d??cision implicite se forme est suspendu d??s r??ception de cette demande et jusqu'?? la production des compl??ments. Au del?? du d??lai fix??, la demande est suceptible d'??tre class??e sans suite ou instruite en l'??tat."
            },
            {
              id: 'datear',
              nom: 'Accus?? de r??ception',
              type: 'date',
              optionnel: true,
              description:
                "Date de l'accus?? de r??ception de la demande de compl??ments ?? compter de laquelle commence ?? courrir le d??lai accord?? pour produire les compl??ments."
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'rcd',
      nom: 'r??ception de compl??ments (d??cision de la mission autorit?? environnementale (examen au cas par cas du projet))',
      description: 'apr??s une dae',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mcb',
      nom: "demande de compl??ments (r??c??piss?? de d??claration loi sur l'eau)",
      description: 'apr??s une rde',
      ordre: 19,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'mcox',
          nom: 'Gestion de la demande de compl??ments',
          elements: [
            {
              id: 'delaifixe',
              nom: 'D??lai fix?? (jour)',
              type: 'number',
              optionnel: true,
              description:
                "Nombre de jours accord??s pour produire les compl??ments demand??s. Le delai au del?? duquel une d??cision implicite se forme est suspendu d??s r??ception de cette demande et jusqu'?? la production des compl??ments. Au del?? du d??lai fix??, la demande est suceptible d'??tre class??e sans suite ou instruite en l'??tat."
            },
            {
              id: 'datear',
              nom: 'Accus?? de r??ception',
              type: 'date',
              optionnel: true,
              description:
                "Date de l'accus?? de r??ception de la demande de compl??ments ?? compter de laquelle commence ?? courrir le d??lai accord?? pour produire les compl??ments."
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'rcb',
      nom: "r??ception de compl??ments (r??c??piss?? de d??claration loi sur l'eau)",
      description: 'apr??s une rde',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'dae',
      nom: 'd??cision de la mission autorit?? environnementale (examen au cas par cas du projet)',

      ordre: 9,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'mea',
          nom: 'Mission autorit?? environnementale',
          elements: [
            {
              id: 'arrete',
              nom: 'Arr??t?? pr??fectoral',
              type: 'text',
              optionnel: true,
              description:
                "Num??ro de l'arr??t?? pr??fectoral portant d??cision dans le cadre de l???examen au cas par cas du projet d???autorisation de recherche mini??re"
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
          nom: 'exempt??',

          couleur: 'success'
        },
        { id: 'req', nom: 'requis', couleur: 'neutral' }
      ]
    },
    {
      id: 'mom',
      nom: 'modification de la demande (d??cision de la mission autorit?? environnementale (examen au cas par cas du projet)',
      description: 'apr??s une dae',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'men',
      nom: 'enregistrement de la demande',
      description:
        "L???enregistrement de la demande est une ??tape de gestion administrative interne du dossier qui se confond au d??p??t de la demande lorsqu'elle est num??rique et d??mat??rialis??e.",
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mod',
      nom: 'modification de la demande',
      description:
        'Le porteur modifie les caract??ristiques fondamentales de sa demande. Cette modification ne change pas le d??lai de d??cision implicite. Les possibilit??s sont limit??es au gr?? de l???avancement de la d??marche, en particulier apr??s la mise en concurrence et apr??s la participation du public.\n',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
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
              description: 'Montant en euro des frais de dossier pay??s'
            },
            {
              id: 'virement',
              nom: 'Virement banquaire ou postal',
              type: 'text',
              optionnel: true,
              description: 'R??f??rence communiqu??e par le demandeur ?? sa banque'
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'vfd',
      nom: 'validation du paiement des frais de dossier',
      description:
        'Acte attestant que le p??titionnaire d???une autorisation de recherches mini??res (ARM) a acquitt?? ses frais de dossier.\n',
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
              description: "Num??ro de facture ??mise par l'ONF"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mcp',
      nom: 'compl??tude de la demande',
      description:
        'Phase d???examen qui permet d?????tablir que toutes les pi??ces exig??es par la r??glementation sont bien fournies par le demandeur. Cet examen ne pr??juge pas de la d??cision qui sera apport??e par l???administration. ',
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
        { id: 'inc', nom: 'incomplet', couleur: 'error' }
      ]
    },
    {
      id: 'mca',
      nom: 'demande de compl??ments (recevabilit?? de la demande)',
      description: 'apr??s une mcr',
      ordre: 20,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'mcox',
          nom: 'Gestion de la demande de compl??ments',
          elements: [
            {
              id: 'delaifixe',
              nom: 'D??lai fix?? (jour)',
              type: 'number',
              optionnel: true,
              description:
                "Nombre de jours accord??s pour produire les compl??ments demand??s. Le delai au del?? duquel une d??cision implicite se forme est suspendu d??s r??ception de cette demande et jusqu'?? la production des compl??ments. Au del?? du d??lai fix??, la demande est suceptible d'??tre class??e sans suite ou instruite en l'??tat."
            },
            {
              id: 'datear',
              nom: 'Accus?? de r??ception',
              type: 'date',
              optionnel: true,
              description:
                "Date de l'accus?? de r??ception de la demande de compl??ments ?? compter de laquelle commence ?? courrir le d??lai accord?? pour produire les compl??ments."
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'rca',
      nom: 'r??ception de compl??ments (recevabilit?? de la demande)',
      description: 'apr??s une mcr',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mcm',
      nom: 'demande de compl??ments (compl??tude de la demande)',
      description: 'apr??s une mcp',
      ordre: 17,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'mcox',
          nom: 'Gestion de la demande de compl??ments',
          elements: [
            {
              id: 'delaifixe',
              nom: 'D??lai fix?? (jour)',
              type: 'number',
              optionnel: true,
              description:
                "Nombre de jours accord??s pour produire les compl??ments demand??s. Le delai au del?? duquel une d??cision implicite se forme est suspendu d??s r??ception de cette demande et jusqu'?? la production des compl??ments. Au del?? du d??lai fix??, la demande est suceptible d'??tre class??e sans suite ou instruite en l'??tat."
            },
            {
              id: 'datear',
              nom: 'Accus?? de r??ception',
              type: 'date',
              optionnel: true,
              description:
                "Date de l'accus?? de r??ception de la demande de compl??ments ?? compter de laquelle commence ?? courrir le d??lai accord?? pour produire les compl??ments."
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'rcm',
      nom: 'r??ception de compl??ments (compl??tude de la demande)',
      description: 'apr??s une mcp',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mim',
      nom: "demande d'informations (recevabilit?? de la demande)",
      description: 'apr??s une mcr',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'rim',
      nom: "r??ception d'information (recevabilit?? de la demande)",
      description: 'apr??s une mcr',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mcr',
      nom: 'recevabilit?? de la demande',
      description:
        'Acte de l???administration ??tablissant que l???examen de compl??tude a ??t?? men?? ?? bien. Le constat de recevabilit?? donne lieu ?? un rapport de la part de l???administration qui constate que le dossier de demande est complet. ',
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
        { id: 'def', nom: 'd??favorable', couleur: 'error' }
      ]
    },
    {
      id: 'meo',
      nom: "prise en charge par l'Office national des for??ts",

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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'edm',
      nom: 'expertise DGTM service pr??vention des risques et industries extractives (DATE)',

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
              description: "??l??ment d'expertise"
            },
            {
              id: 'agent',
              nom: 'Agent',
              type: 'text',
              optionnel: true,
              description: "Pr??nom et nom de l'agent charg?? de l'expertise"
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
        { id: 'def', nom: 'd??favorable', couleur: 'error' }
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mnc',
      nom: 'notification au demandeur (classement sans suite)',
      description: 'apr??s une css',
      ordre: 116,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la d??marche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de r??ception',
              type: 'date',
              optionnel: true,
              description:
                "Date de r??ception ?? compter de laquelle commence ?? courir le d??lai imparti pour signer l'autorisation"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'ede',
      nom: 'expertise DREAL ou DGTM service eau',
      description:
        'Instruction de demande sur la r??glementation ayant trait ?? l???eau par les services de la DGTM.\n',
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
              description: "??l??ment d'expertise"
            },
            {
              id: 'agent',
              nom: 'Agent',
              type: 'text',
              optionnel: true,
              description: "Pr??nom et nom de l'agent charg?? de l'expertise"
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
        { id: 'def', nom: 'd??favorable', couleur: 'error' }
      ]
    },
    {
      id: 'rde',
      nom: "r??c??piss?? de d??claration loi sur l'eau",
      description:
        'Document n??cessaire ?? l???utilisation de l???eau dans le cas d???une autorisation de recherches mini??res (ARM).',
      ordre: 43,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'arm',
          nom: 'Caract??ristiques ARM',
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
              nom: 'Num??ro de dossier',
              type: 'text',
              optionnel: true,
              description: 'Num??ro de dossier DEAL Service eau'
            },
            {
              id: 'numero-recepisse',
              nom: 'Num??ro de r??c??piss??',
              type: 'text',
              optionnel: true,
              description: 'Num??ro de r??c??piss?? ??mis par la DEAL Service eau'
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
        { id: 'def', nom: 'd??favorable', couleur: 'error' }
      ]
    },
    {
      id: 'mio',
      nom: "demande d'informations (expertise de l'Office national des for??ts)",
      description: 'apr??s une eof',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'rio',
      nom: "r??ception d'information (expertise de l'Office national des for??ts)",
      description: 'apr??s une eof',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'eof',
      nom: "expertise de l'Office national des for??ts",
      description:
        'Expertise effectu??e par l???ONF dans le cadre d???une demande d???autorisation de recherches mini??res (ARM).',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mcs',
      nom: 'demande de compl??ments (saisine de la CARM)',
      description: 'apr??s une sca',
      ordre: 21,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'mcox',
          nom: 'Gestion de la demande de compl??ments',
          elements: [
            {
              id: 'delaifixe',
              nom: 'D??lai fix?? (jour)',
              type: 'number',
              optionnel: true,
              description:
                "Nombre de jours accord??s pour produire les compl??ments demand??s. Le delai au del?? duquel une d??cision implicite se forme est suspendu d??s r??ception de cette demande et jusqu'?? la production des compl??ments. Au del?? du d??lai fix??, la demande est suceptible d'??tre class??e sans suite ou instruite en l'??tat."
            },
            {
              id: 'datear',
              nom: 'Accus?? de r??ception',
              type: 'date',
              optionnel: true,
              description:
                "Date de l'accus?? de r??ception de la demande de compl??ments ?? compter de laquelle commence ?? courrir le d??lai accord?? pour produire les compl??ments."
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'rcs',
      nom: 'r??ception de compl??ments (saisine de la CARM)',
      description: 'apr??s une sca',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mia',
      nom: "demande d'informations (avis de l'Office national des for??ts)",
      description: 'apr??s une aof',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'ria',
      nom: "r??ception d'information (avis de l'Office national des for??ts)",
      description: 'apr??s une aof',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'aof',
      nom: "avis de l'Office national des for??ts",
      description:
        'Avis d??livr?? par l???ONF dans le cadre de l???instruction d???un titre minier.\n',
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
          nom: 'favorable avec r??serves',

          couleur: 'warning'
        },
        { id: 'def', nom: 'd??favorable', couleur: 'error' },
        {
          id: 'dre',
          nom: 'd??favorable avec r??serves',

          couleur: 'warning'
        }
      ]
    },
    {
      id: 'sca',
      nom: 'saisine de la commission des autorisations de recherches mini??res (CARM)',

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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'aca',
      nom: 'avis de la commission des autorisations de recherches mini??res (CARM)',

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
        { id: 'def', nom: 'd??favorable', couleur: 'error' },
        {
          id: 'ajo',
          nom: 'ajourn??',

          couleur: 'warning'
        }
      ]
    },
    {
      id: 'mna',
      nom: 'notification au demandeur (ajournement de la CARM)',
      description: 'apr??s une aca ajourn??e',
      ordre: 114,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la d??marche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de r??ception',
              type: 'date',
              optionnel: true,
              description: 'Date de r??ception de la notification'
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mnd',
      nom: 'notification au demandeur (avis d??favorable)',
      description: 'apr??s une aca d??favorable',
      ordre: 117,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la d??marche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de r??ception',
              type: 'date',
              optionnel: true,
              description:
                "Date de r??ception ?? compter de laquelle commence ?? courir le d??lai imparti pour signer l'autorisation"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mnb',
      nom: 'notification au demandeur (avis favorable de la CARM)',
      description: 'apr??s une aca favorable',
      ordre: 115,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la d??marche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de r??ception',
              type: 'date',
              optionnel: true,
              description:
                "Date de r??ception ?? compter de laquelle commence ?? courir le d??lai imparti pour signer l'autorisation"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'pfc',
      nom: 'paiement des frais de dossier compl??mentaires',
      description:
        'Suppl??ment de frais de dossier concernant uniquement les ARM m??canis??es car elles n??cessitent une expertise compl??mentaire (??tat des lieux par imagerie).\n',
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
              nom: 'Frais de dossier compl??mentaires',
              type: 'number',
              optionnel: true,
              description:
                'Montant en euro des frais de dossier compl??mentaires pay??s'
            },
            {
              id: 'virement',
              nom: 'Virement banquaire ou postal',
              type: 'text',
              optionnel: true,
              description: 'R??f??rence communiqu??e par le demandeur ?? sa banque'
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'vfc',
      nom: 'validation du paiement des frais de dossier compl??mentaires',
      description:
        'Validation par la direction g??n??rale des territoires et des mines (DGTM).',
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
              description: "Num??ro de facture ??mise par l'ONF"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'def',
      nom: "d??cision de l'Office national des for??ts",
      description:
        'D??cision de l???ONF dans le cadre des autorisations d???exploitation (AEX) et des autorisations de recherches mini??res (ARM) en tant que propri??taire du sol.',
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
          nom: 'accept??',
          description:
            "La demande a fait l???objet d???une d??cision favorable de l'administration.",
          couleur: 'success'
        },
        {
          id: 'rej',
          nom: 'rejet??',
          description:
            "La demande a fait l???objet d???une d??cision d??favorable de l'administration. Les textes d???applications du code minier pr??voient que les d??cisions de rejet ne font pas l???objet d???une publication. En cons??quence, les d??marches qui passent au statut ???rejet????? dans Camino sont d??-publi??es et rendues inaccessibles aux tiers.\n",
          couleur: 'error'
        }
      ]
    },
    {
      id: 'des',
      nom: 'd??sistement du demandeur',
      description:
        'Le demandeur signifie son souhait de ne pas donner suite ?? sa demande. Le d??sistement met fin ?? la d??marche. Le demandeur ne peut pas se d??sister de sa demande apr??s qu???une d??cision ait ??t?? rendue sur celle-ci.',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'sco',
      nom: 'signature de l???autorisation de recherche mini??re',
      description:
        'Signature de l???autorisation par l???ONF seulement dans le cas d???ARM manuelles ou par les deux parties (ONF et demandeur) dans le cas d???ARM m??canis??es pour acceptation de l?????tat des lieux par le demandeur et valant d??but de validit?? de celle-ci.',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mns',
      nom: 'notification au demandeur (signature de l???autorisation de recherche mini??re)',
      description: 'apr??s une sco',
      ordre: 118,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la d??marche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de r??ception',
              type: 'date',
              optionnel: true,
              description:
                "Date de r??ception ?? compter de laquelle commence ?? courir le d??lai imparti pour signer l'autorisation"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'aco',
      nom: 'avenant ?? l???autorisation de recherche mini??re',
      description:
        'Document (courrier) validant une demande de renouvellement et actant la prolongation de la dur??e de l???autorisation.',
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
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    },
    {
      id: 'mnv',
      nom: "notification au demandeur (signature de l'avenant ?? l???autorisation de recherche mini??re)",
      description: 'apr??s une aco',
      ordre: 119,
      fondamentale: null,
      unique: null,
      acceptationAuto: null,
      dateDebut: null,
      dateFin: null,
      sections: [
        {
          id: 'suivi',
          nom: 'Suivi de la d??marche',
          elements: [
            {
              id: 'dateReception',
              nom: 'Date de r??ception',
              type: 'date',
              optionnel: true,
              description:
                "Date de r??ception ?? compter de laquelle commence ?? courir le d??lai imparti pour signer l'autorisation"
            }
          ]
        }
      ],
      publicLecture: false,
      entreprisesLecture: true,
      etapesCreation: true,
      etapesStatuts: [{ id: 'fai', nom: 'fait', couleur: 'success' }]
    }
  ]

  test('modifie une ??tape existante', () => {
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      demarche,
      'etapeId3',
      '2019-10-11',
      etapesTypes
    )
    expect(etapes).toHaveLength(1)
    expect(etapes.map(({ id }) => id)).toStrictEqual(['dae'])
  })

  test('modifie une ??tape existante ?? la m??me date devrait permettre de recr??er la m??me ??tape', () => {
    for (const etape of demarche?.etapes ?? []) {
      const etapesTypesPossibles =
        etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
          demarche,
          etape.id,
          etape.date,
          etapesTypes
        )
      if (etapesTypesPossibles.length === 0) {
        console.error(
          `pas d'??tapes possibles ?? l'??tape ${JSON.stringify(
            etape
          )}. Devrait contenir AU MOINS la m??me ??tape`
        )
      }
      expect(etapesTypesPossibles.length).toBeGreaterThan(0)
      expect(etapesTypesPossibles.map(({ id }) => id)).toContain(etape.typeId)
    }
  })

  test('ajoute une nouvelle ??tape ?? la fin', () => {
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      demarche,
      undefined,
      '2022-05-06',
      etapesTypes
    )
    expect(etapes).toHaveLength(1)
    expect(etapes[0].id).toBe('mnv')
  })

  test('ajoute une nouvelle ??tape en plein milieu', () => {
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      demarche,
      undefined,
      '2019-12-04',
      etapesTypes
    )
    expect(etapes.map(({ id }) => id)).toStrictEqual(['mod'])
  })

  test('peut faire une dae, une rde et pfd AVANT la mfr', () => {
    const demarche = {
      etapes: [
        {
          id: 'idMfr',
          titreDemarcheId: '',
          typeId: 'mfr',
          statutId: 'fai',
          date: '2022-05-16',
          contenu: { arm: { mecanise: true, franchissements: 2 } }
        },
        {
          id: 'idMdp',
          titreDemarcheId: '',
          typeId: 'mdp',
          statutId: 'fai',
          date: '2022-05-17'
        }
      ]
    }
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      demarche,
      undefined,
      '2019-12-04',
      etapesTypes
    )
    expect(etapes.map(({ id }) => id)).toStrictEqual(['dae', 'pfd', 'rde'])
  })

  test('peut faire que une pfd AVANT la mfr non mecanisee', () => {
    const demarche = {
      etapes: [
        {
          id: 'idMfr',
          titreDemarcheId: '',
          typeId: 'mfr',
          statutId: 'fai',
          date: '2022-05-16',
          contenu: { arm: { mecanise: false } }
        },
        {
          id: 'idMdp',
          titreDemarcheId: '',
          typeId: 'mdp',
          statutId: 'fai',
          date: '2022-05-17'
        }
      ]
    }
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      demarche,
      undefined,
      '2019-12-04',
      etapesTypes
    )
    expect(etapes.map(({ id }) => id)).toStrictEqual(['pfd'])
  })
  test('peut faire une completude (mcp) le m??me jour que le d??p??t (mdp) de la demande', () => {
    const demarche = {
      etapes: [
        {
          id: 'id3',
          titreDemarcheId: '',
          typeId: 'mfr',
          statutId: 'fai',
          date: '2022-06-23',
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
          titreDemarcheId: '',
          typeId: 'dae',
          statutId: 'exe',
          date: '2021-06-22',
          ordre: 1
        },
        {
          id: 'id4',
          titreDemarcheId: '',
          typeId: 'mdp',
          statutId: 'fai',
          date: '2022-07-01',
          ordre: 4
        },
        {
          id: 'id2',
          titreDemarcheId: '',
          typeId: 'pfd',
          statutId: 'fai',
          date: '2021-07-05',
          ordre: 2
        }
      ]
    }
    const etapes = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(
      demarche,
      undefined,
      '2022-07-01',
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
