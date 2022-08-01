import { bodyBuilder, responseExtractor } from './entreprises'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'

const entreprise = { id: 'entrepriseId', categorie: 'PME', nom: 'ma companie' }
const entreprise2 = {
  id: 'entrepriseId2',
  categorie: 'PME',
  nom: 'une compagnie non concernée'
}

describe("extrait la réponse venant d'openFisca", () => {
  test('récupère les bonnes valeurs', () => {
    expect(
      responseExtractor(
        {
          articles: {
            'titre2-auru-97310': {
              redevance_communale_des_mines_aurifere_kg: { '2022': 6604.6 },
              redevance_departementale_des_mines_aurifere_kg: {
                '2022': 1318.54
              }
            }
          }
        },
        2022
      )
    ).toStrictEqual({
      redevanceCommunale: 6604.6,
      redevanceDepartementale: 1318.54
    })
  })
})

describe('construit le corps de la requête pour openFisca', () => {
  test('sans activités', () => {
    expect(bodyBuilder([], [], [], 2022, [entreprise])).toEqual({
      articles: {},
      communes: {},
      titres: {}
    })
  })

  test('avec activités', () => {
    const activitesAnnuelles = [
      { titreId: 'titre2', contenu: { substancesFiscales: { auru: 39.715 } } },
      { titreId: 'titre3', contenu: { substancesFiscales: { auru: 0 } } },
      { titreId: 'titre1', contenu: { substancesFiscales: { auru: 0 } } },
      { titreId: 'titre4', contenu: { substancesFiscales: { auru: 0 } } },
      { titreId: 'titre5', contenu: { substancesFiscales: { auru: 8.91 } } }
    ]
    const activitesTrimestrielles = [
      {
        titreId: 'titre2',
        contenu: { renseignements: { environnement: 7300 } }
      },
      {
        titreId: 'titre3',
        contenu: { renseignements: { environnement: 1000 } }
      }
    ]
    const titres = [
      {
        substances: [
          { id: 'auru', nom: 'or', legales: [{ id: 'auru', nom: 'or' }] }
        ],
        titulaires: [entreprise2],
        amodiataires: [],
        communes: [
          {
            id: '97310',
            nom: 'Roura',
            departementId: DEPARTEMENT_IDS.Guyane,
            surface: 1006827
          }
        ],
        id: 'titreSansActivite'
      },
      {
        substances: [
          { id: 'auru', nom: 'or', legales: [{ id: 'auru', nom: 'or' }] },
          { id: 'suco', nom: 'substances connexes', legales: [] }
        ],
        communes: [
          {
            id: '97310',
            nom: 'Roura',
            departementId: DEPARTEMENT_IDS.Guyane,
            surface: 6036587
          }
        ],
        titulaires: [entreprise2],
        amodiataires: [],
        id: 'titre1'
      },
      {
        substances: [
          { id: 'auru', nom: 'or', legales: [{ id: 'auru', nom: 'or' }] },
          { id: 'suco', nom: 'substances connexes', legales: [] }
        ],
        titulaires: [entreprise],
        amodiataires: [],
        communes: [
          {
            id: '97310',
            nom: 'Roura',
            departementId: DEPARTEMENT_IDS.Guyane,
            surface: 19805494
          }
        ],
        pays: [{ id: 'GF', nom: 'unused' }],
        id: 'titre2'
      },
      {
        substances: [
          { id: 'auru', nom: 'or', legales: [{ id: 'auru', nom: 'or' }] },
          { id: 'suco', nom: 'substances connexes', legales: [] }
        ],
        titulaires: [entreprise2],
        amodiataires: [],
        communes: [
          {
            id: '97310',
            nom: 'Roura',
            departementId: DEPARTEMENT_IDS.Guyane,
            surface: 5143845
          }
        ],
        id: 'titre3'
      },
      {
        substances: [
          { id: 'auru', nom: 'or', legales: [{ id: 'auru', nom: 'or' }] },
          { id: 'suco', nom: 'substances connexes', legales: [] }
        ],
        titulaires: [entreprise2],
        amodiataires: [],
        communes: [
          {
            id: '97310',
            nom: 'Roura',
            departementId: DEPARTEMENT_IDS.Guyane,
            surface: 7676552
          }
        ],
        id: 'titre4'
      },
      {
        substances: [
          { id: 'auru', nom: 'or', legales: [{ id: 'auru', nom: 'or' }] },
          { id: 'suco', nom: 'substances connexes', legales: [] }
        ],
        titulaires: [entreprise],
        amodiataires: [],
        communes: [
          {
            id: '97311',
            nom: 'Saint-Laurent-du-Maroni',
            departementId: DEPARTEMENT_IDS.Guyane,
            surface: 35604009
          }
        ],
        id: 'titre5'
      }
    ]

    expect(
      bodyBuilder(activitesAnnuelles, activitesTrimestrielles, titres, 2022, [
        entreprise,
        entreprise2
      ])
    ).toMatchSnapshot()
  })
})
