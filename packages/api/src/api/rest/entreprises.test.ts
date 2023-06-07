import { bodyBuilder, responseExtractor } from './entreprises.js'
import Titres from '../../database/models/titres.js'
import { describe, expect, test } from 'vitest'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { toCommuneId } from 'camino-common/src/static/communes.js'
import { newTitreId } from '../../database/models/_format/id-create.js'

const entreprise = {
  id: newEntrepriseId('entrepriseId'),
  categorie: 'PME',
  nom: 'ma companie',
}
const entreprise2 = {
  id: newEntrepriseId('entrepriseId2'),
  categorie: 'PME',
  nom: 'une compagnie non concernée',
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
                '2022': 1318.54,
              },
            },
          },
        },
        2022
      )
    ).toStrictEqual({
      redevanceCommunale: 6604.6,
      redevanceDepartementale: 1318.54,
    })
  })
})

describe('construit le corps de la requête pour openFisca', () => {
  test('sans activités', () => {
    expect(bodyBuilder([], [], [], 2022, [entreprise])).toEqual({
      articles: {},
      communes: {},
      titres: {},
    })
  })

  test('avec activités', () => {
    const activitesAnnuelles = [
      { titreId: newTitreId('titre2'), contenu: { substancesFiscales: { auru: 39.715 } } },
      { titreId: newTitreId('titre3'), contenu: { substancesFiscales: { auru: 0 } } },
      { titreId: newTitreId('titre1'), contenu: { substancesFiscales: { auru: 0 } } },
      { titreId: newTitreId('titre4'), contenu: { substancesFiscales: { auru: 0 } } },
      { titreId: newTitreId('titre5'), contenu: { substancesFiscales: { auru: 8.91 } } },
    ]
    const activitesTrimestrielles = [
      {
        titreId: newTitreId('titre2'),
        contenu: { renseignements: { environnement: 7300 } },
      },
      {
        titreId: newTitreId('titre3'),
        contenu: { renseignements: { environnement: 1000 } },
      },
    ]
    const titres: Pick<Titres, 'titulaires' | 'amodiataires' | 'substances' | 'communes' | 'id'>[] = [
      {
        substances: ['auru'],
        titulaires: [entreprise2],
        amodiataires: [],
        communes: [
          {
            id: toCommuneId('97310'),
            surface: 1006827,
          },
        ],
        id: newTitreId('titreSansActivite'),
      },
      {
        substances: ['auru', 'scoc'],
        communes: [
          {
            id: toCommuneId('97310'),
            surface: 6036587,
          },
        ],
        titulaires: [entreprise2],
        amodiataires: [],
        id: newTitreId('titre1'),
      },
      {
        substances: ['auru', 'scoc'],
        titulaires: [entreprise],
        amodiataires: [],
        communes: [
          {
            id: toCommuneId('97310'),
            surface: 19805494,
          },
        ],
        id: newTitreId('titre2'),
      },
      {
        substances: ['auru', 'scoc'],
        titulaires: [entreprise],
        amodiataires: [entreprise2],
        communes: [
          {
            id: toCommuneId('97310'),
            surface: 5143845,
          },
        ],
        id: newTitreId('titre3'),
      },
      {
        substances: ['auru', 'scoc'],
        titulaires: [entreprise2],
        amodiataires: [],
        communes: [
          {
            id: toCommuneId('97310'),
            surface: 7676552,
          },
        ],
        id: newTitreId('titre4'),
      },
      {
        substances: ['auru', 'scoc'],
        titulaires: [entreprise],
        amodiataires: [],
        communes: [
          {
            id: toCommuneId('97311'),
            surface: 35604009,
          },
        ],
        id: newTitreId('titre5'),
      },
    ]

    expect(bodyBuilder(activitesAnnuelles, activitesTrimestrielles, titres, 2022, [entreprise, entreprise2])).toMatchSnapshot()
  })
})
