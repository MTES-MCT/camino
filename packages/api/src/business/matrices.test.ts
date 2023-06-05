import { buildMatrices } from './matrices.js'
import { ITitre } from '../types.js'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { describe, expect, test } from 'vitest'
import { checkCodePostal } from 'camino-common/src/static/departement.js'
import { toCommuneId } from 'camino-common/src/static/communes.js'
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
          taxe_guyane: { '2021': 652.29 },
        },
        'titre2-auru-97358': {
          surface_communale: { '2020': 323907 },
          surface_communale_proportionnee: { '2020': 0.3191007 },
          quantite_aurifere_kg: { '2020': 3.1591 },
          redevance_communale_des_mines_aurifere_kg: { '2021': 167.64 },
          redevance_departementale_des_mines_aurifere_kg: { '2021': 33.47 },
          taxe_guyane_brute: { '2021': 502.08 },
          taxe_guyane_deduction: { '2021': 0 },
          taxe_guyane: { '2021': 502.08 },
        },
        'titre2-auru-97312': {
          surface_communale: { '2020': 691155 },
          surface_communale_proportionnee: { '2020': 0.6808993 },
          quantite_aurifere_kg: { '2020': 3.1591 },
          redevance_communale_des_mines_aurifere_kg: { '2021': 357.72 },
          redevance_departementale_des_mines_aurifere_kg: { '2021': 71.41 },
          taxe_guyane_brute: { '2021': 1071.34 },
          taxe_guyane_deduction: { '2021': 0 },
          taxe_guyane: { '2021': 1071.34 },
        },
        'titre3-auru-97311': {
          surface_communale: { '2020': 1005053 },
          surface_communale_proportionnee: { '2020': 1 },
          quantite_aurifere_kg: { '2020': 6.118269999999995 },
          redevance_communale_des_mines_aurifere_kg: { '2021': 933.47 },
          redevance_departementale_des_mines_aurifere_kg: { '2021': 186.13 },
          taxe_guyane_brute: { '2021': 17950.27 },
          taxe_guyane_deduction: { '2021': 5000 },
          taxe_guyane: { '2021': 12950.27 },
        },
      },
      titres: {
        titre1: {
          commune_principale_exploitation: { '2020': '97310' },
          surface_totale: { '2020': 19805494 },
          operateur: { '2020': 'titulaire1' },
          investissement: { '2020': '131535' },
          categorie: { '2020': 'pme' },
          articles: ['titre1-auru-97310'],
        },
        titre2: {
          commune_principale_exploitation: { '2020': '97312' },
          surface_totale: { '2020': 1015062 },
          operateur: { '2020': 'titulaire2' },
          investissement: { '2020': '0' },
          categorie: { '2020': 'pme' },
          articles: ['titre2-auru-97358', 'titre2-auru-97312'],
        },
        titre3: {
          commune_principale_exploitation: { '2020': '97311' },
          surface_totale: { '2020': 1005053 },
          operateur: { '2020': 'titulaire3' },
          investissement: { '2020': '28000' },
          categorie: { '2020': 'pme' },
          articles: ['titre3-auru-97311'],
        },
      },
      communes: {
        '97310': { articles: ['titre1-auru-97310'] },
        '97311': { articles: ['titre3-auru-97311'] },
        '97312': { articles: ['titre2-auru-97312'] },
        '97358': { articles: ['titre2-auru-97358'] },
      },
    }
    const titres: Pick<ITitre, 'id' | 'slug' | 'titulaires' | 'communes'>[] = [
      {
        id: 'titre1',
        titulaires: [
          {
            id: newEntrepriseId(''),
            nom: 'titulaire1',
            adresse: 'ladresse1',
            legalSiren: 'legalSiren1',
          },
        ],
        slug: 'slug-titre-1',
        communes: [
          {
            id: toCommuneId('97310'),
            nom: 'Roura',
          },
        ],
      },
      {
        id: 'titre2',
        titulaires: [
          {
            id: newEntrepriseId(''),
            nom: 'titulaire2',
            adresse: 'ladresse2',
            legalSiren: 'legalSiren2',
          },
        ],
        slug: 'slug-titre-2',
        communes: [
          {
            id: toCommuneId('97358'),
            nom: 'Saint-Élie',
          },
          {
            id: toCommuneId('97312'),
            nom: 'Sinnamary',
          },
        ],
      },
      {
        id: 'titre3',
        titulaires: [
          {
            id: newEntrepriseId(''),
            nom: 'titulaire3',
            adresse: 'ladresse3',
            codePostal: checkCodePostal('97311'),
            commune: 'Saint-Laurent-du-Maroni',
            legalSiren: 'legalSiren3',
          },
        ],
        slug: 'slug-titre-3',
        communes: [
          {
            id: toCommuneId('97311'),
            nom: 'Saint-Laurent-du-Maroni',
          },
        ],
      },
    ]

    expect(
      buildMatrices(openFiscaResponse, titres, 2021, {
        substances: {
          aloh: { tarifCommunal: 636.4, tarifDepartemental: 127.1 },
          anti: { tarifCommunal: 13.1, tarifDepartemental: 3 },
          arge: { tarifCommunal: 270.2, tarifDepartemental: 53.8 },
          arse: { tarifCommunal: 731.7, tarifDepartemental: 148.7 },
          auru: { tarifCommunal: 166.3, tarifDepartemental: 33.2 },
          bism: { tarifCommunal: 64.1, tarifDepartemental: 13 },
          cfxa: { tarifCommunal: 254.1, tarifDepartemental: 123.4 },
          cfxb: { tarifCommunal: 972.9, tarifDepartemental: 192.6 },
          cfxc: { tarifCommunal: 236.3, tarifDepartemental: 52.4 },
          coox: { tarifCommunal: 356.2, tarifDepartemental: 72.8 },
          cuiv: { tarifCommunal: 21.3, tarifDepartemental: 4.3 },
          etai: { tarifCommunal: 132.5, tarifDepartemental: 26.2 },
          fera: { tarifCommunal: 545.3, tarifDepartemental: 111.4 },
          ferb: { tarifCommunal: 375.7, tarifDepartemental: 78.1 },
          fluo: { tarifCommunal: 827.3, tarifDepartemental: 168.1 },
          hyda: { tarifCommunal: 1635.1, tarifDepartemental: 325.4 },
          hydb: { tarifCommunal: 54.5, tarifDepartemental: 11.3 },
          hydc: { tarifCommunal: 1221.2, tarifDepartemental: 1569.1 },
          hydd: { tarifCommunal: 9.3, tarifDepartemental: 7.3 },
          hyde: { tarifCommunal: 8.6, tarifDepartemental: 6.5 },
          hydf: { tarifCommunal: 351.4, tarifDepartemental: 513 },
          kclx: { tarifCommunal: 286.6, tarifDepartemental: 57.1 },
          lith: { tarifCommunal: 54.5, tarifDepartemental: 11.2 },
          mang: { tarifCommunal: 406.3, tarifDepartemental: 82.2 },
          moly: { tarifCommunal: 270.2, tarifDepartemental: 54.5 },
          naca: { tarifCommunal: 786.7, tarifDepartemental: 159.9 },
          nacb: { tarifCommunal: 478.9, tarifDepartemental: 94.4 },
          nacc: { tarifCommunal: 159.9, tarifDepartemental: 31 },
          plom: { tarifCommunal: 686.4, tarifDepartemental: 132.5 },
          souf: { tarifCommunal: 3.1, tarifDepartemental: 1.7 },
          uran: { tarifCommunal: 323.7, tarifDepartemental: 64.3 },
          wolf: { tarifCommunal: 148.7, tarifDepartemental: 29.1 },
          zinc: { tarifCommunal: 545.3, tarifDepartemental: 111.4 },
        },
        tarifTaxeMinierePME: 498.06,
        tarifTaxeMiniereAutre: 123.97,
      })
    ).toMatchSnapshot()
  })
})
