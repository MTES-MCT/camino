import { bodyBuilder, responseExtractor } from './entreprises.js'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement.js'
import Titres from '../../database/models/titres.js'
import { describe, expect, test } from 'vitest'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'

const entreprise = {
  id: newEntrepriseId('entrepriseId'),
  categorie: 'PME',
  nom: 'ma companie'
}
const entreprise2 = {
  id: newEntrepriseId('entrepriseId2'),
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
    const titres: Pick<
      Titres,
      'titulaires' | 'amodiataires' | 'substances' | 'communes' | 'id'
    >[] = [
      {
        substances: ['auru'],
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
        substances: ['auru', 'scoc'],
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
        substances: ['auru', 'scoc'],
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
        id: 'titre2'
      },
      {
        substances: ['auru', 'scoc'],
        titulaires: [entreprise],
        amodiataires: [entreprise2],
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
        substances: ['auru', 'scoc'],
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
        substances: ['auru', 'scoc'],
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
