import { bodyBuilder, responseExtractor } from './entreprises'
import Titres from '../../database/models/titres'
import { describe, expect, test } from 'vitest'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { toCommuneId } from 'camino-common/src/static/communes'
import { newTitreId } from '../../database/models/_format/id-create'

const entrepriseId = newEntrepriseId('entrepriseId')
const entreprise2Id = newEntrepriseId('entrepriseId2')

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
    expect(
      bodyBuilder([], [], [], 2022, [
        {
          id: entrepriseId,
          categorie: 'PME',
          nom: 'ma companie',
        },
      ])
    ).toEqual({
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
    const titres: Pick<Titres, 'titulaireIds' | 'amodiataireIds' | 'substances' | 'communes' | 'id'>[] = [
      {
        substances: ['auru'],
        titulaireIds: [entreprise2Id],
        amodiataireIds: [],
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
        titulaireIds: [entreprise2Id],
        amodiataireIds: [],
        id: newTitreId('titre1'),
      },
      {
        substances: ['auru', 'scoc'],
        titulaireIds: [entrepriseId],
        amodiataireIds: [],
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
        titulaireIds: [entrepriseId],
        amodiataireIds: [entreprise2Id],
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
        titulaireIds: [entreprise2Id],
        amodiataireIds: [],
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
        titulaireIds: [entrepriseId],
        amodiataireIds: [],
        communes: [
          {
            id: toCommuneId('97311'),
            surface: 35604009,
          },
        ],
        id: newTitreId('titre5'),
      },
    ]

    expect(
      bodyBuilder(activitesAnnuelles, activitesTrimestrielles, titres, 2022, [
        {
          id: entrepriseId,
          categorie: 'PME',
          nom: 'ma companie',
        },
        {
          id: entreprise2Id,
          categorie: 'PME',
          nom: 'une compagnie non concernée',
        },
      ])
    ).toMatchSnapshot()
  })
})
