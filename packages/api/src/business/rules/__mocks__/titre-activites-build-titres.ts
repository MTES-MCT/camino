import { IActiviteType, ITitreDemarche } from '../../../types.js'
import { SubstancesFiscale } from 'camino-common/src/static/substancesFiscales.js'
import { UNITES } from 'camino-common/src/static/unites.js'

const activiteTypeGra = {
  id: 'gra',
  frequenceId: 'ann',
  sections: [{ id: 'substancesFiscales' }],
} as IActiviteType

const activiteTypeGrp = {
  id: 'grp',
  frequenceId: 'tri',
  sections: [
    {
      id: 'renseignements',
      nom: 'Renseignements',
      elements: [
        {
          id: 'champ-1',
          nom: 'Nom champ 1',
          type: 'number',
          optionnel: true,
          description: 'Description champs 1',
        },
        {
          id: 'champ-2',
          nom: 'Nom champs 2',
          type: 'checkboxes',
          valeurs: [{ id: 'un', nom: 'Uno' }],
          dateFin: '2018-04-01',
          description: 'Description champs 2',
        },
        {
          id: 'champ-3',
          nom: 'Nom champs 3',
          type: 'checkboxes',
          valeursMetasNom: 'unites',
          dateDebut: '2018-07-01',
          description: 'Description champs 3',
          periodesIds: [3],
        },
      ],
    },
  ],
} as IActiviteType

const titreActivitesGra = [
  {
    titreId: 'titre-id',
    date: '2019-01-01',
    typeId: 'gra',
    activiteStatutId: 'abs',
    periodeId: 1,
    annee: 2018,
    sections: [
      {
        id: 'substancesFiscales',
        elements: [
          {
            id: SubstancesFiscale.auru.id,
            nom: SubstancesFiscale.auru.nom,
            type: 'number',
            description: '<b>g (gramme)</b> contenu dans les minerais',
            referenceUniteRatio: 0.001,
            uniteId: SubstancesFiscale.auru.uniteId,
          },
          {
            id: SubstancesFiscale.naca.id,
            nom: SubstancesFiscale.naca.nom,
            type: 'number',
            description: '<b>x 1000 t (millier de tonnes)</b> extrait par abattage net livré',
            referenceUniteRatio: 1000000,
            uniteId: SubstancesFiscale.naca.uniteId,
          },
          {
            description: '<b>x 1000 t (millier de tonnes)</b> extrait en dissolution par sondage et livré raffiné',
            id: SubstancesFiscale.nacb.id,
            nom: SubstancesFiscale.nacb.nom,
            referenceUniteRatio: 1000000,
            type: 'number',
            uniteId: SubstancesFiscale.nacb.uniteId,
          },
          {
            description: '<b>x 1000 t (millier de tonnes)</b> extrait en dissolution par sondage et livré en dissolution',
            id: SubstancesFiscale.nacc.id,
            nom: SubstancesFiscale.nacc.nom,
            referenceUniteRatio: 1000000,
            type: 'number',
            uniteId: SubstancesFiscale.nacc.uniteId,
          },
        ],
      },
    ],
  },
]

const titreActivitesGrp = [
  {
    titreId: 'titre-id',
    date: '2018-04-01',
    typeId: 'grp',
    activiteStatutId: 'abs',
    periodeId: 1,
    annee: 2018,
    sections: [
      {
        id: 'renseignements',
        elements: [
          {
            id: 'champ-1',
            nom: 'Nom champ 1',
            optionnel: true,
            type: 'number',
            description: 'Description champs 1',
          },
          {
            id: 'champ-2',
            nom: 'Nom champs 2',
            type: 'checkboxes',
            description: 'Description champs 2',
            valeurs: [{ id: 'un', nom: 'Uno' }],
          },
        ],
        nom: 'Renseignements',
      },
    ],
  },
  {
    titreId: 'titre-id',
    date: '2018-07-01',
    typeId: 'grp',
    activiteStatutId: 'abs',
    periodeId: 2,
    annee: 2018,
    sections: [
      {
        id: 'renseignements',
        elements: [
          {
            id: 'champ-1',
            nom: 'Nom champ 1',
            optionnel: true,
            type: 'number',
            description: 'Description champs 1',
          },
        ],
        nom: 'Renseignements',
      },
    ],
  },
  {
    titreId: 'titre-id',
    date: '2018-10-01',
    typeId: 'grp',
    activiteStatutId: 'abs',
    periodeId: 3,
    annee: 2018,
    sections: [
      {
        id: 'renseignements',
        elements: [
          {
            id: 'champ-1',
            nom: 'Nom champ 1',
            optionnel: true,
            type: 'number',
            description: 'Description champs 1',
          },
          {
            id: 'champ-3',
            nom: 'Nom champs 3',
            type: 'checkboxes',
            description: 'Description champs 3',
            valeurs: UNITES,
          },
        ],
        nom: 'Renseignements',
      },
    ],
  },
  {
    titreId: 'titre-id',
    date: '2019-01-01',
    typeId: 'grp',
    activiteStatutId: 'abs',
    periodeId: 4,
    annee: 2018,
    sections: [
      {
        id: 'renseignements',
        elements: [
          {
            id: 'champ-1',
            nom: 'Nom champ 1',
            optionnel: true,
            type: 'number',
            description: 'Description champs 1',
          },
        ],
        nom: 'Renseignements',
      },
    ],
  },
]

const titreDemarches = [
  {
    id: 'demarche-id',
    statutId: 'acc',
    typeId: 'oct',
    type: { id: 'oct' },
    demarcheDateDebut: '2018-01-01',
    demarcheDateFin: '2018-12-31',
    etapes: [
      {
        id: 'etape-id',
        date: '2018-01-01',
        typeId: 'dpu',
        statutId: 'fai',
        substances: ['auru', 'nacl', null],
      },
    ],
  } as ITitreDemarche,
]

export { titreActivitesGra, titreActivitesGrp, activiteTypeGra, activiteTypeGrp, titreDemarches }
