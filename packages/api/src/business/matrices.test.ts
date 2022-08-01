import { buildMatrices } from './matrices'
import { ITitre } from '../types'

describe('matrices', () => {
  test('buildMatrices', () => {
    const openFiscaResponse = {
      articles: {
        'titre1-auru-97310': {
          surface_communale: { '2020': 19805494 },
          surface_communale_proportionnee: { '2020': 1 },
          quantite_aurifere_kg: { '2020': 12.243 },
          redevance_communale_des_mines_aurifere_kg: { '2021': 284.71 },
          redevance_departementale_des_mines_aurifere_kg: { '2021': 56.27 },
          taxe_guyane_brute: { '2021': 852.29 },
          taxe_guyane_deduction: { '2021': 200 },
          taxe_guyane: { '2021': 652.29 }
        },
        'titre2-auru-97358': {
          surface_communale: { '2020': 323907 },
          surface_communale_proportionnee: { '2020': 0.3191007 },
          quantite_aurifere_kg: { '2020': 3.1591 },
          redevance_communale_des_mines_aurifere_kg: { '2021': 167.64 },
          redevance_departementale_des_mines_aurifere_kg: { '2021': 33.47 },
          taxe_guyane_brute: { '2021': 502.08 },
          taxe_guyane_deduction: { '2021': 0 },
          taxe_guyane: { '2021': 502.08 }
        },
        'titre2-auru-97312': {
          surface_communale: { '2020': 691155 },
          surface_communale_proportionnee: { '2020': 0.6808993 },
          quantite_aurifere_kg: { '2020': 3.1591 },
          redevance_communale_des_mines_aurifere_kg: { '2021': 357.72 },
          redevance_departementale_des_mines_aurifere_kg: { '2021': 71.41 },
          taxe_guyane_brute: { '2021': 1071.34 },
          taxe_guyane_deduction: { '2021': 0 },
          taxe_guyane: { '2021': 1071.34 }
        },
        'titre3-auru-97311': {
          surface_communale: { '2020': 1005053 },
          surface_communale_proportionnee: { '2020': 1 },
          quantite_aurifere_kg: { '2020': 6.118269999999995 },
          redevance_communale_des_mines_aurifere_kg: { '2021': 933.47 },
          redevance_departementale_des_mines_aurifere_kg: { '2021': 186.13 },
          taxe_guyane_brute: { '2021': 17950.27 },
          taxe_guyane_deduction: { '2021': 5000 },
          taxe_guyane: { '2021': 12950.27 }
        }
      },
      titres: {
        titre1: {
          commune_principale_exploitation: { '2020': '97310' },
          surface_totale: { '2020': 19805494 },
          operateur: { '2020': 'titulaire1' },
          investissement: { '2020': '131535' },
          categorie: { '2020': 'pme' },
          articles: ['titre1-auru-97310']
        },
        titre2: {
          commune_principale_exploitation: { '2020': '97312' },
          surface_totale: { '2020': 1015062 },
          operateur: { '2020': 'titulaire2' },
          investissement: { '2020': '0' },
          categorie: { '2020': 'pme' },
          articles: ['titre2-auru-97358', 'titre2-auru-97312']
        },
        titre3: {
          commune_principale_exploitation: { '2020': '97311' },
          surface_totale: { '2020': 1005053 },
          operateur: { '2020': 'titulaire3' },
          investissement: { '2020': '28000' },
          categorie: { '2020': 'pme' },
          articles: ['titre3-auru-97311']
        }
      },
      communes: {
        '97310': { articles: ['titre1-auru-97310'] },
        '97311': { articles: ['titre3-auru-97311'] },
        '97312': { articles: ['titre2-auru-97312'] },
        '97358': { articles: ['titre2-auru-97358'] }
      }
    }
    const titres: Pick<ITitre, 'id' | 'slug' | 'titulaires' | 'communes'>[] = [
      {
        id: 'titre1',
        titulaires: [
          {
            id: '',
            nom: 'titulaire1',
            adresse: 'ladresse1',
            legalSiren: 'legalSiren1'
          }
        ],
        slug: 'slug-titre-1',
        communes: [
          {
            id: '97310',
            nom: 'Roura',
            departementId: '973'
          }
        ]
      },
      {
        id: 'titre2',
        titulaires: [
          {
            id: '',
            nom: 'titulaire2',
            adresse: 'ladresse2',
            legalSiren: 'legalSiren2'
          }
        ],
        slug: 'slug-titre-2',
        communes: [
          {
            id: '97358',
            nom: 'Saint-Élie',
            departementId: '973'
          },
          {
            id: '97312',
            nom: 'Sinnamary',
            departementId: '973'
          }
        ]
      },
      {
        id: 'titre3',
        titulaires: [
          {
            id: '',
            nom: 'titulaire3',
            adresse: 'ladresse3',
            legalSiren: 'legalSiren3'
          }
        ],
        slug: 'slug-titre-3',
        communes: [
          {
            id: '97311',
            nom: 'Saint-Laurent-du-Maroni',
            departementId: '973'
          }
        ]
      }
    ]

    expect(
      buildMatrices(openFiscaResponse, titres, 2021, {
        tarifCommunal: 166.3,
        tarifDepartemental: 33.2,
        tarifTaxeMinierePME: 498.06
      })
    ).toMatchSnapshot()
  })
})
